# Geoportal e Plataforma de Gestão do PRAD — Conjunto Eólico Umburanas

Plataforma web integrada, responsiva e pronta para produção destinada à gestão, acompanhamento físico-temporal e visualização geoespacial da execução do Plano de Recuperação de Áreas Degradadas (PRAD) do Conjunto Eólico Umburanas (ENGIE / EcoBrasil Consultoria Ambiental).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Mapas & GIS**: MapLibre GL JS, Proj4, GeoJSON
- **Banco de Dados**: PostgreSQL 16 com extensão PostGIS 3.4
- **ORM & Client**: Drizzle ORM / `pg` (node-postgres)
- **Gráficos & Visualização**: Recharts
- **Importação/Exportação**: SheetJS (XLSX)
- **Containerização**: Docker & Docker Compose

---

## 🚀 Como Executar o Projeto no Mac / Local

### Pré-requisitos
- Node.js v20 ou superior
- Docker & Docker Desktop

### 1. Clocar e Acessar o Diretório
```bash
cd /Users/maurivanvazribeiro/Documents/Maurivan_Workspace/04_Projetos_Tecnologia/UMBURANAS-PRAD/
```

### 2. Subir o Banco PostgreSQL + PostGIS (via Docker)
```bash
docker run -d --name prad-postgis -p 5435:5432 -e POSTGRES_DB=umburanas_prad -e POSTGRES_USER=prad_user -e POSTGRES_PASSWORD=prad_pass postgis/postgis:16-3.4
```

### 3. Instalar Dependências e Executar a Migração (ETL)
```bash
npm install
npm run db:import
```

### 4. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse a aplicação no navegador em:
👉 **`http://localhost:3000`**

---

## 📊 Módulos da Plataforma

1. **Dashboard Executivo (`/dashboard`)**:
   - KPIs recalculados em tempo real a partir do PostgreSQL (85,07% progresso geral, 33 áreas concluídas, 41,87 ha executados, 25 dias restantes).
   - Gráficos Recharts de avanço territorial e evolução temporal.

2. **Geoportal Espacial (`/geoportal`)**:
   - Visualização das 16 fotografias georreferenciadas no município de Umburanas - BA (Zona UTM 24S / EPSG:31984).
   - **6 Camadas Espaciais Vetoriais (SHP)**:
     - 📷 Registros Fotográficos de Campo (com clusterização e popups)
     - 📍 38 Áreas PRAD
     - 🌀 144 Aerogeradores
     - 🛣️ 269 Acessos e Vias Internas
     - 🌳 6 Reservas Legais (RL)
     - ⚡ 18 Parques Eólicos SPE (UM-01 a UM-18)
     - 🗺️ Poligonal Geral CEUR
   - Alternância entre Mapa Cartográfico e Imagem de Satélite.
   - Formulário "+ Novo Registro Espacial" via clique no mapa, coordenadas UTM/Lat-Lng ou GPS mobile.

3. **Base de Áreas PRAD (`/areas` e `/areas/[id]`)**:
   - Tabela rica das 38 áreas com filtros, ordenação, busca e exportação para Excel.
   - Página detalhada de cada área com abas (Visão Geral, Fotografias Vinculadas e Trilha de Auditoria).

4. **Planejamento Quinzenal (`/planejamento`)**:
   - Acompanhamento de metas físicas por quinzena (Coleta de solo, avanço territorial de 50.26 ha, canteiro principal e irrigação).

5. **Cronograma Macro (`/cronograma`)**:
   - Linha do tempo das 12 atividades macro para 2026-2028 com controle de prorrogações e términos reais.

6. **Galeria Fotográfica (`/galeria`)**:
   - Acervo de fotografias de campo com modal de ampliação, carimbos transcritos e indicação de fotos sem localização.

7. **Relatórios (`/relatorios`) & Administração (`/configuracoes`)**:
   - Exportação customizada para Excel e PDF impresso.
   - Parâmetros do sistema de referência espacial (EPSG:31984, SIRGAS 2000 UTM 24S) e status da base PostGIS.

---

## 🧪 Testes Automatizados

Executar os testes de conversão de coordenadas e integridade da base de dados:
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' tests/coords.test.ts
npx ts-node --compiler-options '{"module":"CommonJS"}' tests/import.test.ts
```
