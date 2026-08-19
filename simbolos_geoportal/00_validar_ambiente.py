#!/usr/bin/env python3
from __future__ import annotations

import importlib
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

REQUIRED = [
    "requests",
    "yaml",
    "dotenv",
    "numpy",
    "pandas",
    "geopandas",
    "rasterio",
    "pyproj",
    "owslib",
    "sentinelhub",
    "earthaccess",
]


def main():
    load_dotenv()
    print(f"Python: {sys.version.split()[0]}")
    print(f"Executável: {sys.executable}")
    print(f"Pasta: {Path.cwd()}")

    missing = []
    for module in REQUIRED:
        try:
            importlib.import_module(module)
            print(f"[OK] {module}")
        except Exception as exc:
            missing.append(module)
            print(f"[FALTA] {module}: {exc}")

    print("\nCredenciais:")
    for key in [
        "CDSE_CLIENT_ID",
        "CDSE_CLIENT_SECRET",
        "OPENTOPOGRAPHY_API_KEY",
        "BDC_TOKEN",
    ]:
        print(f"{key}: {'configurada' if os.getenv(key) else 'não configurada'}")

    if missing:
        print("\nInstale as dependências com:")
        print("python -m pip install -r requirements.txt")
        raise SystemExit(1)

    print("\nAmbiente pronto.")


if __name__ == "__main__":
    main()
