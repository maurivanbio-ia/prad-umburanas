#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import date, timedelta

from dotenv import load_dotenv

from geoportal_data.common import resolve_bbox
from geoportal_data.orchestrator import run_pipeline


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(
        description="Executa o pipeline geoespacial automático do projeto Umburanas."
    )
    parser.add_argument("--aoi", help="SHP, GPKG ou GeoJSON da área do projeto.")
    parser.add_argument("--bbox", help="oeste,sul,leste,norte em EPSG:4326.")
    parser.add_argument(
        "--inicio",
        default=(date.today() - timedelta(days=60)).isoformat(),
    )
    parser.add_argument("--fim", default=date.today().isoformat())
    parser.add_argument("--saida", default="downloads")
    parser.add_argument("--sem-ortofoto", action="store_true")
    parser.add_argument("--sem-copernicus", action="store_true")
    parser.add_argument("--sem-inpe", action="store_true")
    parser.add_argument("--sem-opentopography", action="store_true")
    parser.add_argument("--com-nasa", action="store_true")
    args = parser.parse_args()

    bbox = resolve_bbox(args.bbox, args.aoi)

    manifest = run_pipeline(
        bbox=bbox,
        output_root=args.saida,
        start_date=args.inicio,
        end_date=args.fim,
        run_ide_bahia=not args.sem_ortofoto,
        run_copernicus=not args.sem_copernicus,
        run_inpe=not args.sem_inpe,
        run_opentopography=not args.sem_opentopography,
        run_nasa=args.com_nasa,
    )
    print(json.dumps(manifest, indent=2, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
