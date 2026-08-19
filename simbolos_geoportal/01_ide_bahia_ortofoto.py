#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from geoportal_data.common import resolve_bbox
from geoportal_data.ide_bahia import discover_layers, download_orthophoto


def main():
    parser = argparse.ArgumentParser(
        description="Baixa a ortofoto IDE Bahia/CONDER via WMS."
    )
    parser.add_argument("--aoi", help="SHP, GPKG ou GeoJSON da área do projeto.")
    parser.add_argument("--bbox", help="oeste,sul,leste,norte em EPSG:4326.")
    parser.add_argument(
        "--saida",
        default="downloads/ortofoto/ide_bahia_ortofoto_80cm.tif",
    )
    parser.add_argument("--resolucao", type=float, default=0.8)
    parser.add_argument("--max-dimensao", type=int, default=8000)
    parser.add_argument("--listar-layers", action="store_true")
    args = parser.parse_args()

    if args.listar_layers:
        print("\n".join(discover_layers()))
        return

    bbox = resolve_bbox(args.bbox, args.aoi)
    info = download_orthophoto(
        bbox=bbox,
        output_path=args.saida,
        resolution_m=args.resolucao,
        max_dimension=args.max_dimensao,
    )
    print(info)


if __name__ == "__main__":
    main()
