from __future__ import annotations

import json
import math
import os
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np
import requests
from pyproj import Geod
from rasterio.transform import from_bounds
import rasterio


WGS84 = "EPSG:4326"


def ensure_dir(path: str | Path) -> Path:
    path = Path(path).expanduser().resolve()
    path.mkdir(parents=True, exist_ok=True)
    return path


def parse_bbox(value: str | Sequence[float]) -> tuple[float, float, float, float]:
    """Retorna bbox na ordem oeste, sul, leste, norte."""
    if isinstance(value, str):
        parts = [float(v.strip()) for v in value.split(",")]
    else:
        parts = [float(v) for v in value]

    if len(parts) != 4:
        raise ValueError("A bbox deve ter quatro valores: oeste,sul,leste,norte.")

    west, south, east, north = parts
    if not (-180 <= west <= 180 and -180 <= east <= 180):
        raise ValueError("Longitudes fora do intervalo válido.")
    if not (-90 <= south <= 90 and -90 <= north <= 90):
        raise ValueError("Latitudes fora do intervalo válido.")
    if west >= east or south >= north:
        raise ValueError("BBox inválida. Use oeste < leste e sul < norte.")
    return west, south, east, north


def bbox_from_vector(path: str | Path) -> tuple[float, float, float, float]:
    """Lê SHP, GPKG, GeoJSON ou outro formato suportado pelo GeoPandas."""
    import geopandas as gpd

    path = Path(path).expanduser().resolve()
    if not path.exists():
        raise FileNotFoundError(path)

    gdf = gpd.read_file(path)
    if gdf.empty:
        raise ValueError(f"O arquivo não possui feições: {path}")
    if gdf.crs is None:
        raise ValueError(
            "O arquivo vetorial não possui CRS definido. Defina o sistema de referência antes de executar."
        )

    gdf = gdf.to_crs(WGS84)
    west, south, east, north = gdf.total_bounds.tolist()
    return parse_bbox((west, south, east, north))


def resolve_bbox(
    bbox: str | Sequence[float] | None = None,
    aoi: str | Path | None = None,
) -> tuple[float, float, float, float]:
    if bbox is not None:
        return parse_bbox(bbox)
    if aoi is not None:
        return bbox_from_vector(aoi)
    raise ValueError("Informe --bbox ou --aoi.")


def dimensions_for_bbox(
    bbox: Sequence[float],
    resolution_m: float,
    max_dimension: int | None = None,
) -> tuple[int, int, float]:
    """
    Calcula largura/altura aproximadas em pixels para uma bbox WGS84.
    Retorna width, height e resolução efetiva aproximada em metros.
    """
    west, south, east, north = parse_bbox(bbox)
    if resolution_m <= 0:
        raise ValueError("A resolução deve ser maior que zero.")

    geod = Geod(ellps="WGS84")
    mid_lat = (south + north) / 2
    mid_lon = (west + east) / 2

    _, _, width_m = geod.inv(west, mid_lat, east, mid_lat)
    _, _, height_m = geod.inv(mid_lon, south, mid_lon, north)

    width = max(1, int(math.ceil(abs(width_m) / resolution_m)))
    height = max(1, int(math.ceil(abs(height_m) / resolution_m)))
    effective_res = resolution_m

    if max_dimension and max(width, height) > max_dimension:
        scale = max(width, height) / max_dimension
        effective_res = resolution_m * scale
        width = max(1, int(math.ceil(width / scale)))
        height = max(1, int(math.ceil(height / scale)))

    return width, height, effective_res


def save_array_geotiff(
    array: np.ndarray,
    bbox: Sequence[float],
    output_path: str | Path,
    crs: str = WGS84,
    nodata: float | int | None = None,
    compress: str = "deflate",
) -> Path:
    """
    Salva ndarray como GeoTIFF georreferenciado.
    Aceita HxW, HxWxBands ou BandsxHxW.
    """
    output_path = Path(output_path).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    arr = np.asarray(array)
    if arr.ndim == 2:
        arr = arr[np.newaxis, :, :]
    elif arr.ndim == 3:
        # Sentinel Hub normalmente retorna HxWxBands.
        if arr.shape[-1] <= 20 and arr.shape[0] > 20 and arr.shape[1] > 20:
            arr = np.moveaxis(arr, -1, 0)
    else:
        raise ValueError(f"Formato de array não suportado: {arr.shape}")

    bands, height, width = arr.shape
    west, south, east, north = parse_bbox(bbox)
    transform = from_bounds(west, south, east, north, width, height)

    profile = {
        "driver": "GTiff",
        "height": height,
        "width": width,
        "count": bands,
        "dtype": arr.dtype,
        "crs": crs,
        "transform": transform,
        "compress": compress,
        "tiled": True,
        "BIGTIFF": "IF_SAFER",
    }
    if nodata is not None:
        profile["nodata"] = nodata

    with rasterio.open(output_path, "w", **profile) as dst:
        dst.write(arr)

    return output_path


def session_with_retries(
    retries: int = 5,
    backoff: float = 1.0,
    timeout: int = 120,
) -> requests.Session:
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry

    retry = Retry(
        total=retries,
        connect=retries,
        read=retries,
        status=retries,
        backoff_factor=backoff,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET", "POST"}),
        raise_on_status=False,
    )
    session = requests.Session()
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.mount("http://", HTTPAdapter(max_retries=retry))
    session.request_timeout = timeout
    session.headers.update(
        {"User-Agent": "Umburanas-Geoportal/1.0 (+environmental-monitoring)"}
    )
    return session


def download_http(
    url: str,
    destination: str | Path,
    headers: dict | None = None,
    chunk_size: int = 1024 * 1024,
    timeout: int = 180,
) -> Path:
    destination = Path(destination).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    session = session_with_retries()
    with session.get(url, headers=headers, stream=True, timeout=timeout) as response:
        response.raise_for_status()
        with open(destination, "wb") as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
    return destination


def write_json(data, destination: str | Path) -> Path:
    destination = Path(destination).expanduser().resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    with open(destination, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    return destination


def env(name: str, default: str | None = None, required: bool = False) -> str | None:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(
            f"Variável de ambiente obrigatória ausente: {name}. "
            "Configure o arquivo .env ou exporte a variável no terminal."
        )
    return value
