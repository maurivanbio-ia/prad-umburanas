#!/usr/bin/env python3
from __future__ import annotations

import argparse

from geoportal_data.common import resolve_bbox
from geoportal_data.nasa_earthdata import download_nasadem


def main():
    parser = argparse.ArgumentParser(
        description="Baixa NASADEM via NASA CMR/Earthdata usando earthaccess."
    )
    parser.add_argument("--aoi")
    parser.add_argument("--bbox", help="oeste,sul,leste,norte em EPSG:4326.")
    parser.add_argument("--saida", default="downloads/nasa")
    parser.add_argument("--max-granules", type=int, default=50)
    args = parser.parse_args()

    bbox = resolve_bbox(args.bbox, args.aoi)
    info = download_nasadem(
        bbox=bbox,
        output_dir=args.saida,
        max_granules=args.max_granules,
    )
    print(info)


if __name__ == "__main__":
    main()
