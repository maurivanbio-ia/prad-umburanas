from __future__ import annotations

import os
from pathlib import Path
from typing import Sequence

from .common import parse_bbox, session_with_retries


API_URL = "https://portal.opentopography.org/API/globaldem"


def download_global_dem(
    bbox: Sequence[float],
    output_path: str | Path,
    demtype: str = "ANADEM",
    api_key: str | None = None,
    output_format: str = "GTiff",
) -> dict:
    """
    Baixa DEM global pela REST API do OpenTopography.

    demtype úteis para o Brasil incluem ANADEM, COP30 e NASADEM.
    Consulte a documentação do OpenTopography para a lista vigente.
    """
    bbox = parse_bbox(bbox)
    west, south, east, north = bbox

    key = api_key or os.getenv("OPENTOPOGRAPHY_API_KEY")
    if not key:
        raise RuntimeError(
            "Configure OPENTOPOGRAPHY_API_KEY no arquivo .env. "
            "A API Global DEM exige chave."
        )

    params = {
        "demtype": demtype,
        "south": south,
        "north": north,
        "west": west,
        "east": east,
        "outputFormat": output_format,
        "API_Key": key,
    }

    output_path = Path(output_path).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    session = session_with_retries()
    with session.get(API_URL, params=params, stream=True, timeout=600) as response:
        if response.status_code >= 400:
            detail = response.text[:1000]
            raise RuntimeError(
                f"OpenTopography retornou HTTP {response.status_code}. "
                f"demtype={demtype}. Resposta: {detail}"
            )
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

    return {
        "source": "OpenTopography Global Datasets API",
        "demtype": demtype,
        "bbox": bbox,
        "output": str(output_path),
    }


def download_best_available_dem(
    bbox: Sequence[float],
    output_dir: str | Path,
    candidates: list[str] | None = None,
) -> dict:
    """
    Tenta DEMs em ordem. Por padrão: ANADEM, COP30, NASADEM.
    """
    output_dir = Path(output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    candidates = candidates or ["ANADEM", "COP30", "NASADEM"]

    errors = {}
    for demtype in candidates:
        out = output_dir / f"dem_{demtype.lower()}.tif"
        try:
            return download_global_dem(bbox, out, demtype=demtype)
        except Exception as exc:
            errors[demtype] = str(exc)

    raise RuntimeError(f"Nenhum DEM pôde ser baixado. Erros: {errors}")
