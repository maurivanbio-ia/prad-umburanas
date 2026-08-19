#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import date, timedelta
from pathlib import Path

from dotenv import load_dotenv

from geoportal_data.common import resolve_bbox
from geoportal_data.copernicus import (
    download_sentinel2_product,
    search_sentinel2_stac,
)


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(
        description="Pesquisa e baixa Sentinel 2 L2A do Copernicus Data Space."
    )
    parser.add_argument("--aoi")
    parser.add_argument("--bbox", help="oeste,sul,leste,norte em EPSG:4326.")
    parser.add_argument(
        "--inicio",
        default=(date.today() - timedelta(days=60)).isoformat(),
    )
    parser.add_argument("--fim", default=date.today().isoformat())
    parser.add_argument("--nuvens", type=float, default=20)
    parser.add_argument(
        "--produto",
        choices=["rgb", "ndvi", "ndwi", "savi", "todos", "somente_catalogo"],
        default="todos",
    )
    parser.add_argument("--resolucao", type=float, default=10)
    parser.add_argument("--saida", default="downloads/copernicus")
    args = parser.parse_args()

    bbox = resolve_bbox(args.bbox, args.aoi)
    outdir = Path(args.saida).expanduser().resolve()
    outdir.mkdir(parents=True, exist_ok=True)

    items = search_sentinel2_stac(
        bbox=bbox,
        start_date=args.inicio,
        end_date=args.fim,
        max_cloud=args.nuvens,
        output_json=outdir / "sentinel2_stac.json",
        output_csv=outdir / "sentinel2_stac.csv",
    )
    print(f"Itens no catálogo: {len(items.get('features', []))}")

    if args.produto == "somente_catalogo":
        return

    products = ["rgb", "ndvi", "ndwi", "savi"] if args.produto == "todos" else [args.produto]
    for product in products:
        print(f"Baixando {product}...")
        info = download_sentinel2_product(
            bbox=bbox,
            start_date=args.inicio,
            end_date=args.fim,
            output_path=outdir / f"sentinel2_{product}.tif",
            product=product,
            resolution_m=args.resolucao,
            max_cloud=args.nuvens,
        )
        print(info)


if __name__ == "__main__":
    main()
