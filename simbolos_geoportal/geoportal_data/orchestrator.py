from __future__ import annotations

import json
import os
from datetime import date, timedelta
from pathlib import Path
from typing import Sequence

from dotenv import load_dotenv

from .common import ensure_dir, parse_bbox, write_json
from .copernicus import download_sentinel2_product, search_sentinel2_stac
from .ide_bahia import download_orthophoto
from .inpe_bdc import download_bdc_assets, search_bdc
from .nasa_earthdata import download_nasadem
from .opentopography import download_best_available_dem


def run_pipeline(
    bbox: Sequence[float],
    output_root: str | Path,
    start_date: str | None = None,
    end_date: str | None = None,
    run_ide_bahia: bool = True,
    run_copernicus: bool = True,
    run_inpe: bool = True,
    run_opentopography: bool = True,
    run_nasa: bool = False,
) -> dict:
    """
    Executa o pipeline completo e registra sucesso ou erro de cada fonte.

    O pipeline não aborta se uma fonte falhar. Isso é intencional para permitir
    fallback entre provedores.
    """
    load_dotenv()
    bbox = parse_bbox(bbox)
    output_root = ensure_dir(output_root)

    end_date = end_date or date.today().isoformat()
    start_date = start_date or (date.today() - timedelta(days=60)).isoformat()

    manifest: dict = {
        "bbox": bbox,
        "start_date": start_date,
        "end_date": end_date,
        "sources": {},
    }

    if run_ide_bahia:
        try:
            out = output_root / "ortofoto" / "ide_bahia_ortofoto_80cm.tif"
            manifest["sources"]["ide_bahia"] = {
                "status": "ok",
                **download_orthophoto(bbox, out),
            }
        except Exception as exc:
            manifest["sources"]["ide_bahia"] = {"status": "erro", "error": str(exc)}

    if run_copernicus:
        try:
            cop_dir = ensure_dir(output_root / "copernicus")
            stac = search_sentinel2_stac(
                bbox,
                start_date,
                end_date,
                max_cloud=20,
                output_json=cop_dir / "sentinel2_stac.json",
                output_csv=cop_dir / "sentinel2_stac.csv",
            )
            manifest["sources"]["copernicus_stac"] = {
                "status": "ok",
                "items_returned": len(stac.get("features", [])),
            }

            for product in ["rgb", "ndvi", "ndwi", "savi"]:
                try:
                    info = download_sentinel2_product(
                        bbox=bbox,
                        start_date=start_date,
                        end_date=end_date,
                        output_path=cop_dir / f"sentinel2_{product}.tif",
                        product=product,
                        resolution_m=10,
                        max_cloud=20,
                    )
                    manifest["sources"][f"copernicus_{product}"] = {
                        "status": "ok",
                        **info,
                    }
                except Exception as exc:
                    manifest["sources"][f"copernicus_{product}"] = {
                        "status": "erro",
                        "error": str(exc),
                    }
        except Exception as exc:
            manifest["sources"]["copernicus_stac"] = {
                "status": "erro",
                "error": str(exc),
            }

    if run_inpe:
        try:
            bdc_dir = ensure_dir(output_root / "inpe_bdc")
            items = search_bdc(
                bbox,
                collection="CB4-16D-2",
                start_date=start_date,
                end_date=end_date,
                output_json=bdc_dir / "bdc_items.json",
            )
            files = download_bdc_assets(
                items,
                output_dir=bdc_dir / "assets",
                asset_keys=["NDVI", "EVI", "thumbnail"],
                max_items=3,
            )
            manifest["sources"]["inpe_bdc"] = {
                "status": "ok",
                "items_returned": len(items.get("features", [])),
                "assets_downloaded": [str(p) for p in files],
            }
        except Exception as exc:
            manifest["sources"]["inpe_bdc"] = {"status": "erro", "error": str(exc)}

    if run_opentopography:
        try:
            topo_dir = ensure_dir(output_root / "opentopography")
            info = download_best_available_dem(bbox, topo_dir)
            manifest["sources"]["opentopography"] = {"status": "ok", **info}
        except Exception as exc:
            manifest["sources"]["opentopography"] = {
                "status": "erro",
                "error": str(exc),
            }

    if run_nasa:
        try:
            nasa_dir = ensure_dir(output_root / "nasa")
            info = download_nasadem(bbox, nasa_dir)
            manifest["sources"]["nasa"] = {"status": "ok", **info}
        except Exception as exc:
            manifest["sources"]["nasa"] = {"status": "erro", "error": str(exc)}

    write_json(manifest, output_root / "manifest_downloads.json")
    return manifest
