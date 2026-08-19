#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv

from geoportal_data.common import resolve_bbox
from geoportal_data.inpe_bdc import download_bdc_assets, search_bdc


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(
        description="Pesquisa e baixa assets do Brazil Data Cube via STAC."
    )
    parser.add_argument("--aoi")
    parser.add_argument("--bbox", help="oeste,sul,leste,norte em EPSG:4326.")
    parser.add_argument("--colecao", default="CB4-16D-2")
    parser.add_argument(
        "--inicio",
        default=(date.today() - timedelta(days=365)).isoformat(),
    )
    parser.add_argument("--fim", default=date.today().isoformat())
    parser.add_argument("--saida", default="downloads/inpe_bdc")
    parser.add_argument("--max-itens", type=int, default=3)
    parser.add_argument(
        "--assets",
        default="NDVI,EVI,thumbnail",
        help="Chaves STAC separadas por vírgula.",
    )
    args = parser.parse_args()

    bbox = resolve_bbox(args.bbox, args.aoi)
    outdir = Path(args.saida).expanduser().resolve()
    outdir.mkdir(parents=True, exist_ok=True)

    items = search_bdc(
        bbox=bbox,
        collection=args.colecao,
        start_date=args.inicio,
        end_date=args.fim,
        output_json=outdir / "bdc_items.json",
    )
    print(f"Itens retornados: {len(items.get('features', []))}")

    paths = download_bdc_assets(
        items,
        output_dir=outdir / "assets",
        asset_keys=[v.strip() for v in args.assets.split(",") if v.strip()],
        max_items=args.max_itens,
    )
    for path in paths:
        print(path)


if __name__ == "__main__":
    main()
