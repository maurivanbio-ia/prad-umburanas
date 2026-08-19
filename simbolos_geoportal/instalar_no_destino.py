#!/usr/bin/env python3
from __future__ import annotations

import shutil
from pathlib import Path


TARGET = Path(
    "/Users/maurivanvazribeiro/Documents/Maurivan_Workspace/"
    "04_Projetos_Tecnologia/UMBURANAS-PRAD/SIMBOLOS/deliverables/"
    "simbolos_geoportal"
).expanduser()


def main():
    source = Path(__file__).resolve().parent

    TARGET.mkdir(parents=True, exist_ok=True)

    ignored = {
        "__pycache__",
        ".DS_Store",
        "downloads",
        "logs",
    }

    for item in source.iterdir():
        if item.name in ignored:
            continue

        destination = TARGET / item.name
        if item.is_dir():
            shutil.copytree(item, destination, dirs_exist_ok=True)
        else:
            shutil.copy2(item, destination)

    (TARGET / "downloads").mkdir(exist_ok=True)
    (TARGET / "logs").mkdir(exist_ok=True)

    print("Arquivos instalados em:")
    print(TARGET)
    print("\nPróximos passos:")
    print(f'cd "{TARGET}"')
    print("python3 -m venv .venv")
    print("source .venv/bin/activate")
    print("python -m pip install --upgrade pip")
    print("python -m pip install -r requirements.txt")
    print("cp .env.example .env")
    print("python 00_validar_ambiente.py")


if __name__ == "__main__":
    main()
