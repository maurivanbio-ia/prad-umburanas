#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from dotenv import load_dotenv

from geoportal_data.common import resolve_bbox
from geoportal_data.opentopography import (
    download_best_available_dem,
    download_global_dem,
)


def main():
    load_dotenv()
    parser = argparse.ArgumentParser(
        description="Baixa DEM pela Global Datasets API do OpenTopography."
    )
    parser.add_argument("--aoi")
    parser.add_argument("--bbox", help="oeste,sul,leste,norte em EPSG:4326.")
    parser.add_argument(
        "--dem",
        default="AUTO",
        help="AUTO, ANADEM, COP30, NASADEM ou outro demtype suportado.",
    )
    parser.add_argument("--saida", default="downloads/opentopography")
    args = parser.parse_args()

    bbox = resolve_bbox(args.bbox, args.aoi)
    outdir = Path(args.saida).expanduser().resolve()
    outdir.mkdir(parents=True, exist_ok=True)

    if args.dem.upper() == "AUTO":
        info = download_best_available_dem(bbox, outdir)
    else:
        info = download_global_dem(
            bbox,
            outdir / f"dem_{args.dem.lower()}.tif",
            demtype=args.dem,
        )
    print(info)


if __name__ == "__main__":
    main()
