from __future__ import annotations

from pathlib import Path
from typing import Sequence

from .common import parse_bbox


def login_earthdata():
    """
    Tenta autenticação por variáveis de ambiente e, se necessário, modo interativo.
    """
    import earthaccess

    try:
        auth = earthaccess.login(strategy="environment", persist=True)
        if auth:
            return auth
    except Exception:
        pass

    return earthaccess.login(persist=True)


def download_nasadem(
    bbox: Sequence[float],
    output_dir: str | Path,
    short_name: str = "NASADEM_HGT",
    version: str = "001",
    max_granules: int = 50,
    authenticate: bool = True,
) -> dict:
    """
    Pesquisa no NASA CMR e baixa granules NASADEM que intersectam a bbox.
    """
    import earthaccess

    bbox = parse_bbox(bbox)
    output_dir = Path(output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    if authenticate:
        login_earthdata()

    granules = earthaccess.search_data(
        count=max_granules,
        short_name=short_name,
        version=version,
        bounding_box=bbox,
        downloadable=True,
    )

    if not granules:
        raise RuntimeError(
            f"Nenhum granule encontrado para {short_name} v{version} na área."
        )

    paths = earthaccess.download(
        granules,
        local_path=str(output_dir),
        threads=4,
        show_progress=True,
    )

    return {
        "source": "NASA Earthdata / CMR via earthaccess",
        "short_name": short_name,
        "version": version,
        "bbox": bbox,
        "granules_found": len(granules),
        "downloaded": [str(p) for p in paths],
    }
