from __future__ import annotations

import os
from pathlib import Path
from typing import Sequence
from urllib.parse import urljoin, urlparse

from .common import download_http, parse_bbox, session_with_retries, write_json


BDC_STAC_ROOT = "https://brazildatacube.dpi.inpe.br/stac/"


def _headers() -> dict:
    token = os.getenv("BDC_TOKEN")
    if token:
        return {"Authorization": f"Bearer {token}"}
    return {}


def _discover_search_endpoint(root_url: str = BDC_STAC_ROOT) -> str:
    session = session_with_retries()
    response = session.get(root_url, headers=_headers(), timeout=120)
    response.raise_for_status()
    root = response.json()

    for link in root.get("links", []):
        if link.get("rel") == "search" and link.get("href"):
            return link["href"]

    return urljoin(root_url, "search")


def search_bdc(
    bbox: Sequence[float],
    collection: str = "CB4-16D-2",
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
    output_json: str | Path | None = None,
    root_url: str = BDC_STAC_ROOT,
) -> dict:
    """
    Pesquisa itens no STAC do Brazil Data Cube.

    A coleção CB4-16D-2 é usada como padrão por possuir exemplos oficiais
    documentados pelo projeto BDC. Outras coleções podem ser informadas via CLI.
    """
    bbox = parse_bbox(bbox)
    endpoint = _discover_search_endpoint(root_url)

    payload = {
        "collections": [collection],
        "bbox": list(bbox),
        "limit": int(limit),
    }
    if start_date and end_date:
        payload["datetime"] = f"{start_date}T00:00:00Z/{end_date}T23:59:59Z"

    session = session_with_retries()
    response = session.post(endpoint, json=payload, headers=_headers(), timeout=120)
    response.raise_for_status()
    data = response.json()

    if output_json:
        write_json(data, output_json)
    return data


def download_bdc_assets(
    stac_items: dict,
    output_dir: str | Path,
    asset_keys: list[str] | None = None,
    max_items: int = 3,
) -> list[Path]:
    """
    Baixa assets HTTP dos primeiros itens STAC.

    Se asset_keys for None, tenta NDVI, EVI e thumbnail.
    """
    output_dir = Path(output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    wanted = asset_keys or ["NDVI", "EVI", "thumbnail"]

    downloaded: list[Path] = []
    for item in stac_items.get("features", [])[:max_items]:
        item_id = item.get("id", "item")
        assets = item.get("assets", {})
        for key in wanted:
            asset = assets.get(key)
            if not asset:
                continue
            href = asset.get("href")
            if not href or not href.startswith(("http://", "https://")):
                continue

            parsed = urlparse(href)
            filename = Path(parsed.path).name or f"{item_id}_{key}"
            destination = output_dir / f"{item_id}_{key}_{filename}"
            download_http(href, destination, headers=_headers())
            downloaded.append(destination)

    return downloaded
