# Geoportal Umburanas. Download automático de dados geoespaciais

Este pacote reúne conectores Python para obter automaticamente dados que podem alimentar o geoportal do projeto UMBURANAS-PRAD.

## Fontes implementadas

1. IDE Bahia / CONDER. Ortofoto de 80 cm via WMS.
2. Copernicus Data Space Ecosystem. Pesquisa STAC e download/processamento Sentinel 2 L2A via Sentinel Hub.
3. INPE / Brazil Data Cube. Pesquisa STAC e download de assets.
4. OpenTopography. Download de DEM por API REST, com prioridade para ANADEM, COP30 e NASADEM.
5. NASA Earthdata. Pesquisa e download de NASADEM via `earthaccess`.

## Observação importante sobre a ortofoto da Bahia

O arquivo gerado por `01_ide_bahia_ortofoto.py` é uma extração georreferenciada do serviço WMS. Ele não deve ser apresentado como sendo, necessariamente, o arquivo fotogramétrico GeoTIFF original da SEI/CONDER.

## Instalação no Mac

No Terminal:

```bash
cd "/caminho/onde/voce/descompactou/simbolos_geoportal"
python3 instalar_no_destino.py
```

O instalador copiará os arquivos para:

```text
/Users/maurivanvazribeiro/Documents/Maurivan_Workspace/04_Projetos_Tecnologia/UMBURANAS-PRAD/SIMBOLOS/deliverables/simbolos_geoportal
```

Depois:

```bash
cd "/Users/maurivanvazribeiro/Documents/Maurivan_Workspace/04_Projetos_Tecnologia/UMBURANAS-PRAD/SIMBOLOS/deliverables/simbolos_geoportal"

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

cp .env.example .env
```

Edite o arquivo `.env` e informe as credenciais que possuir.

## Área de interesse

Você pode usar um SHP, GPKG ou GeoJSON:

```bash
python 01_ide_bahia_ortofoto.py \
  --aoi "/caminho/area_projeto.gpkg"
```

Ou uma bounding box em EPSG:4326:

```bash
python 01_ide_bahia_ortofoto.py \
  --bbox "-41.5,-11.0,-41.0,-10.5"
```

A ordem é:

```text
oeste,sul,leste,norte
```

## 00. Validar ambiente

```bash
python 00_validar_ambiente.py
```

## 01. Ortofoto IDE Bahia

Listar layers:

```bash
python 01_ide_bahia_ortofoto.py --listar-layers
```

Baixar para uma AOI:

```bash
python 01_ide_bahia_ortofoto.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --saida "downloads/ortofoto/umburanas_ortofoto_80cm.tif"
```

## 02. Copernicus Sentinel 2

Primeiro crie um OAuth Client no Copernicus Data Space Ecosystem e preencha:

```text
CDSE_CLIENT_ID=
CDSE_CLIENT_SECRET=
```

Pesquisar o catálogo sem baixar processamento:

```bash
python 02_copernicus_sentinel2.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --produto somente_catalogo
```

Baixar RGB, NDVI, NDWI e SAVI:

```bash
python 02_copernicus_sentinel2.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --inicio 2026-06-01 \
  --fim 2026-08-19 \
  --nuvens 20 \
  --produto todos
```

## 03. INPE Brazil Data Cube

```bash
python 03_inpe_bdc.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --colecao "CB4-16D-2"
```

Por padrão o script tenta baixar:

```text
NDVI
EVI
thumbnail
```

## 04. OpenTopography

Preencha no `.env`:

```text
OPENTOPOGRAPHY_API_KEY=
```

Download automático com fallback:

```bash
python 04_opentopography_dem.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --dem AUTO
```

Ordem padrão:

```text
ANADEM
COP30
NASADEM
```

## 05. NASA Earthdata

```bash
python 05_nasa_earthdata.py \
  --aoi "/caminho/area_projeto.gpkg"
```

O produto padrão é `NASADEM_HGT`, versão `001`.

## 06. Pipeline completo

```bash
python 06_pipeline_umburanas.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --inicio 2026-06-01 \
  --fim 2026-08-19 \
  --saida "downloads"
```

O pipeline tenta, de forma independente:

```text
IDE Bahia
Copernicus STAC
Copernicus RGB
Copernicus NDVI
Copernicus NDWI
Copernicus SAVI
INPE Brazil Data Cube
OpenTopography
```

Para incluir também o download direto do NASA Earthdata:

```bash
python 06_pipeline_umburanas.py \
  --aoi "/caminho/area_projeto.gpkg" \
  --com-nasa
```

Ao final é criado:

```text
downloads/manifest_downloads.json
```

Esse arquivo registra quais provedores responderam, quais falharam, os arquivos gerados e os parâmetros utilizados.

## Estrutura esperada

```text
simbolos_geoportal/
├── 00_validar_ambiente.py
├── 01_ide_bahia_ortofoto.py
├── 02_copernicus_sentinel2.py
├── 03_inpe_bdc.py
├── 04_opentopography_dem.py
├── 05_nasa_earthdata.py
├── 06_pipeline_umburanas.py
├── instalar_no_destino.py
├── .env.example
├── config.yaml
├── requirements.txt
├── geoportal_data/
├── downloads/
└── logs/
```

## Segurança

Não coloque chaves de API diretamente nos scripts. Use `.env`.

Não publique `.env` no GitHub.

## Referências técnicas dos endpoints implementados

Copernicus STAC:

```text
https://stac.dataspace.copernicus.eu/v1/
```

Copernicus Sentinel Hub:

```text
https://sh.dataspace.copernicus.eu
```

Brazil Data Cube STAC:

```text
https://brazildatacube.dpi.inpe.br/stac/
```

OpenTopography Global DEM:

```text
https://portal.opentopography.org/API/globaldem
```

IDE Bahia / CONDER WMS:

```text
http://maps.informs.conder.ba.gov.br/arcgis/services/MOSAICO/RASTER_ORTOFOTO_SEI_2010_24/ImageServer/WMSServer
```

NASA Earthdata é acessado pela biblioteca `earthaccess`, que consulta o CMR.
