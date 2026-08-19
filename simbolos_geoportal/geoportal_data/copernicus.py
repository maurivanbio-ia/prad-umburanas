from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Sequence

import numpy as np
import requests

from .common import ensure_dir, parse_bbox, save_array_geotiff, session_with_retries, write_json


CDSE_STAC_ROOT = "https://stac.dataspace.copernicus.eu/v1/"
CDSE_STAC_SEARCH = "https://stac.dataspace.copernicus.eu/v1/search"
CDSE_TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/"
    "protocol/openid-connect/token"
)
CDSE_SH_BASE_URL = "https://sh.dataspace.copernicus.eu"


def search_sentinel2_stac(
    bbox: Sequence[float],
    start_date: str,
    end_date: str,
    max_cloud: float = 20.0,
    limit: int = 50,
    output_json: str | Path | None = None,
    output_csv: str | Path | None = None,
) -> dict:
    """
    Pesquisa produtos Sentinel 2 L2A no novo STAC do Copernicus Data Space.
    A pesquisa de catálogo não baixa dados.
    """
    bbox = parse_bbox(bbox)
    payload = {
        "collections": ["sentinel-2-l2a"],
        "bbox": list(bbox),
        "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
        "limit": int(limit),
        "filter": {
            "op": "<=",
            "args": [{"property": "eo:cloud_cover"}, float(max_cloud)],
        },
    }

    session = session_with_retries()
    response = session.post(CDSE_STAC_SEARCH, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()

    if output_json:
        write_json(data, output_json)

    if output_csv:
        output_csv = Path(output_csv).expanduser().resolve()
        output_csv.parent.mkdir(parents=True, exist_ok=True)
        rows = []
        for item in data.get("features", []):
            props = item.get("properties", {})
            rows.append(
                {
                    "id": item.get("id"),
                    "datetime": props.get("datetime"),
                    "cloud_cover": props.get("eo:cloud_cover"),
                    "collection": item.get("collection"),
                    "bbox": item.get("bbox"),
                }
            )
        with open(output_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(
                f,
                fieldnames=["id", "datetime", "cloud_cover", "collection", "bbox"],
            )
            writer.writeheader()
            writer.writerows(rows)

    return data


def _cdse_config():
    from sentinelhub import SHConfig

    client_id = os.getenv("CDSE_CLIENT_ID")
    client_secret = os.getenv("CDSE_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise RuntimeError(
            "Para baixar imagens pelo Sentinel Hub, configure CDSE_CLIENT_ID e "
            "CDSE_CLIENT_SECRET no arquivo .env."
        )

    config = SHConfig()
    config.sh_client_id = client_id
    config.sh_client_secret = client_secret
    config.sh_token_url = CDSE_TOKEN_URL
    config.sh_base_url = CDSE_SH_BASE_URL
    config.download_timeout_seconds = 600
    return config


def _evalscript(product: str) -> tuple[str, float | int | None, str]:
    product = product.lower()

    if product == "rgb":
        script = """
        //VERSION=3
        function setup() {
          return {
            input: [{bands: ["B04", "B03", "B02", "SCL", "dataMask"]}],
            output: {bands: 3, sampleType: "UINT8"}
          };
        }
        function evaluatePixel(s) {
          let cloud = [3,8,9,10,11].includes(s.SCL);
          if (!s.dataMask || cloud) return [0,0,0];
          return [
            Math.min(255, Math.max(0, 255 * 2.5 * s.B04)),
            Math.min(255, Math.max(0, 255 * 2.5 * s.B03)),
            Math.min(255, Math.max(0, 255 * 2.5 * s.B02))
          ];
        }
        """
        return script, 0, "uint8"

    formulas = {
        "ndvi": (
            ["B04", "B08"],
            "(s.B08 - s.B04) / (s.B08 + s.B04)",
        ),
        "ndwi": (
            ["B03", "B08"],
            "(s.B03 - s.B08) / (s.B03 + s.B08)",
        ),
        "savi": (
            ["B04", "B08"],
            "1.5 * (s.B08 - s.B04) / (s.B08 + s.B04 + 0.5)",
        ),
    }
    if product not in formulas:
        raise ValueError("Produto inválido. Use rgb, ndvi, ndwi ou savi.")

    bands, formula = formulas[product]
    denominator_check = {
        "ndvi": "(s.B08 + s.B04) === 0",
        "ndwi": "(s.B03 + s.B08) === 0",
        "savi": "(s.B08 + s.B04 + 0.5) === 0",
    }[product]

    script = f"""
    //VERSION=3
    function setup() {{
      return {{
        input: [{{bands: {bands + ["SCL", "dataMask"]}}}],
        output: {{bands: 1, sampleType: "FLOAT32"}}
      }};
    }}
    function evaluatePixel(s) {{
      let cloud = [3,8,9,10,11].includes(s.SCL);
      if (!s.dataMask || cloud || {denominator_check}) return [-9999];
      return [{formula}];
    }}
    """
    return script, -9999.0, "float32"


def download_sentinel2_product(
    bbox: Sequence[float],
    start_date: str,
    end_date: str,
    output_path: str | Path,
    product: str = "rgb",
    resolution_m: float = 10.0,
    max_cloud: float = 20.0,
    max_dimension: int = 2500,
) -> dict:
    """
    Baixa uma composição Sentinel 2 L2A via Sentinel Hub Process API.

    product: rgb, ndvi, ndwi ou savi.
    """
    from sentinelhub import (
        BBox,
        CRS,
        DataCollection,
        MimeType,
        MosaickingOrder,
        SentinelHubRequest,
        bbox_to_dimensions,
    )

    bbox = parse_bbox(bbox)
    config = _cdse_config()
    sh_bbox = BBox(bbox=bbox, crs=CRS.WGS84)

    size = bbox_to_dimensions(sh_bbox, resolution=resolution_m)
    width, height = int(size[0]), int(size[1])
    effective_resolution = float(resolution_m)

    if max(width, height) > max_dimension:
        factor = max(width, height) / max_dimension
        effective_resolution = resolution_m * factor
        size = bbox_to_dimensions(sh_bbox, resolution=effective_resolution)
        width, height = int(size[0]), int(size[1])

    evalscript, nodata, expected_dtype = _evalscript(product)

    request = SentinelHubRequest(
        evalscript=evalscript,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L2A,
                time_interval=(start_date, end_date),
                mosaicking_order=MosaickingOrder.LEAST_CC,
                maxcc=float(max_cloud) / 100.0,
            )
        ],
        responses=[SentinelHubRequest.output_response("default", MimeType.TIFF)],
        bbox=sh_bbox,
        size=(width, height),
        config=config,
    )

    data = request.get_data()[0]
    if data is None or np.asarray(data).size == 0:
        raise RuntimeError("O Sentinel Hub não retornou pixels para a área/período.")

    arr = np.asarray(data)
    if product.lower() == "rgb":
        arr = arr.astype(np.uint8, copy=False)
    else:
        arr = arr.astype(np.float32, copy=False)

    output_path = save_array_geotiff(
        arr,
        bbox=bbox,
        output_path=output_path,
        crs="EPSG:4326",
        nodata=nodata,
    )

    return {
        "source": "Copernicus Data Space Ecosystem / Sentinel Hub",
        "product": product.lower(),
        "bbox": bbox,
        "time_interval": [start_date, end_date],
        "max_cloud_percent": max_cloud,
        "requested_resolution_m": resolution_m,
        "effective_resolution_m_approx": round(effective_resolution, 3),
        "size": [width, height],
        "output": str(output_path),
    }
