from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Sequence

import numpy as np
import rasterio
from owslib.wms import WebMapService
from rasterio.io import MemoryFile

from .common import (
    dimensions_for_bbox,
    ensure_dir,
    parse_bbox,
    save_array_geotiff,
)


DEFAULT_WMS = (
    "http://maps.informs.conder.ba.gov.br/arcgis/services/"
    "MOSAICO/RASTER_ORTOFOTO_SEI_2010_24/ImageServer/WMSServer"
)


def discover_layers(wms_url: str = DEFAULT_WMS) -> list[str]:
    """Consulta GetCapabilities e retorna os layers publicados pelo serviço."""
    wms = WebMapService(wms_url, version="1.3.0", timeout=120)
    return list(wms.contents.keys())


def download_orthophoto(
    bbox: Sequence[float],
    output_path: str | Path,
    resolution_m: float = 0.8,
    max_dimension: int = 8000,
    wms_url: str = DEFAULT_WMS,
    layer_name: str | None = None,
) -> dict:
    """
    Baixa a imagem WMS da ortofoto SEI/CONDER e grava GeoTIFF georreferenciado.

    Atenção:
    O WMS é um serviço de mapa. O arquivo produzido é uma extração georreferenciada
    da resposta do serviço, e não deve ser tratado como o arquivo fotogramétrico
    original distribuído pela instituição.
    """
    bbox = parse_bbox(bbox)
    output_path = Path(output_path).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    wms = WebMapService(wms_url, version="1.3.0", timeout=120)
    layers = list(wms.contents.keys())
    if not layers:
        raise RuntimeError("Nenhum layer foi encontrado no WMS.")

    layer = layer_name or layers[0]
    if layer not in wms.contents:
        raise ValueError(f"Layer '{layer}' não encontrado. Disponíveis: {layers}")

    width, height, effective_resolution = dimensions_for_bbox(
        bbox=bbox,
        resolution_m=resolution_m,
        max_dimension=max_dimension,
    )

    # OWSLib trata a construção da requisição WMS.
    response = wms.getmap(
        layers=[layer],
        styles=[""],
        srs="EPSG:4326",
        bbox=bbox,
        size=(width, height),
        format="image/tiff",
        transparent=False,
    )
    content = response.read()

    # A resposta WMS pode ser TIFF sem georreferenciamento interno.
    # A bbox usada na requisição é aplicada explicitamente ao arquivo final.
    try:
        with MemoryFile(content) as mem:
            with mem.open() as src:
                arr = src.read()
    except Exception as exc:
        raise RuntimeError(
            "O servidor WMS não retornou um TIFF válido. "
            "Tente reduzir a área ou usar PNG como diagnóstico."
        ) from exc

    save_array_geotiff(
        arr,
        bbox=bbox,
        output_path=output_path,
        crs="EPSG:4326",
    )

    return {
        "source": "IDE Bahia / CONDER",
        "service": wms_url,
        "layer": layer,
        "bbox": bbox,
        "requested_resolution_m": resolution_m,
        "effective_resolution_m_approx": round(effective_resolution, 3),
        "width": width,
        "height": height,
        "output": str(output_path),
    }
