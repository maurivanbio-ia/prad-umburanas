import { Pool } from 'pg';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import proj4 from 'proj4';

// Define UTM 24S (SIRGAS 2000 / UTM zone 24S - EPSG:31984) and WGS84 (EPSG:4326)
proj4.defs('EPSG:31984', '+proj=utm +zone=24 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs');

const connectionString = process.env.DATABASE_URL || 'postgres://prad_user:prad_pass@localhost:5435/umburanas_prad';
const pool = new Pool({ connectionString });

const BASE_DIR = '/Users/maurivanvazribeiro/Documents/Maurivan_Workspace/04_Projetos_Tecnologia/UMBURANAS-PRAD';

async function seed() {
  console.log('🚀 Starting UMBURANAS-PRAD database migration & seed...');
  const client = await pool.connect();

  try {
    // 1. Enable PostGIS & create tables
    console.log('📦 Setting up PostGIS and database schema...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "postgis";');

    await client.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS photo_area_links CASCADE;
      DROP TABLE IF EXISTS photos CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS schedule_items CASCADE;
      DROP TABLE IF EXISTS planning_items CASCADE;
      DROP TABLE IF EXISTS prad_areas CASCADE;
      DROP TABLE IF EXISTS activity_statuses CASCADE;
      DROP TABLE IF EXISTS activities CASCADE;
      DROP TABLE IF EXISTS wind_complexes CASCADE;
      DROP TABLE IF EXISTS project_settings CASCADE;

      CREATE TABLE project_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        label TEXT,
        "group" TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE wind_complexes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        code TEXT,
        description TEXT
      );

      CREATE TABLE prad_areas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        number INT NOT NULL,
        wind_complex TEXT,
        name TEXT NOT NULL,
        area_ha DOUBLE PRECISION NOT NULL,
        action_type TEXT,
        soil_collection_status TEXT DEFAULT 'Não iniciado',
        soil_collection_date TIMESTAMP,
        maintenance_status TEXT DEFAULT 'Não iniciado',
        maintenance_date TIMESTAMP,
        irrigation_status TEXT DEFAULT 'Não iniciado',
        irrigation_date TIMESTAMP,
        operational_monitoring TEXT DEFAULT 'Não iniciado',
        ecological_monitoring TEXT DEFAULT 'Não iniciado',
        responsible TEXT DEFAULT 'Equipe de Campo',
        status TEXT DEFAULT 'Em andamento',
        completion_pct DOUBLE PRECISION DEFAULT 0,
        start_date TIMESTAMP,
        planned_end_date TIMESTAMP,
        real_end_date TIMESTAMP,
        new_date TIMESTAMP,
        remaining_days INT,
        notes TEXT,
        fortnight TEXT,
        result_protocol TEXT,
        pending_issue TEXT,
        extension_date TIMESTAMP,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE activities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        category TEXT,
        description TEXT
      );

      CREATE TABLE activity_statuses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE planning_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code INT,
        activity TEXT NOT NULL,
        unit TEXT NOT NULL,
        target_metric DOUBLE PRECISION NOT NULL,
        start_date TIMESTAMP,
        planned_end_date TIMESTAMP,
        real_end_date TIMESTAMP,
        new_date TIMESTAMP,
        responsible TEXT,
        status TEXT DEFAULT 'Em andamento',
        completion_pct DOUBLE PRECISION DEFAULT 0,
        executed DOUBLE PRECISION DEFAULT 0,
        remaining DOUBLE PRECISION DEFAULT 0,
        notes TEXT
      );

      CREATE TABLE schedule_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code INT,
        activity TEXT NOT NULL,
        planned_start TIMESTAMP,
        planned_end TIMESTAMP,
        real_end TIMESTAMP,
        new_date TIMESTAMP,
        status TEXT DEFAULT 'Não iniciado',
        weight INT DEFAULT 1,
        dependencies TEXT,
        notes TEXT
      );

      CREATE TABLE photos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_name TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        mime_type TEXT DEFAULT 'image/jpeg',
        file_size INT,
        captured_at TIMESTAMP,
        hora TEXT,
        utm_zone TEXT,
        easting DOUBLE PRECISION,
        northing DOUBLE PRECISION,
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        code TEXT,
        local TEXT,
        activity TEXT,
        notes TEXT,
        confidence TEXT DEFAULT 'Alta',
        area_id UUID,
        responsible TEXT DEFAULT 'Equipe de Campo',
        is_georeferenced BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE photo_area_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        photo_id UUID NOT NULL,
        area_id UUID NOT NULL,
        confirmed_by TEXT,
        confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'Consulta',
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT,
        user_name TEXT DEFAULT 'Sistema',
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        field_name TEXT,
        old_value TEXT,
        new_value TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        category TEXT DEFAULT 'Geral',
        file_size INT,
        storage_path TEXT NOT NULL,
        area_id UUID,
        uploaded_by TEXT DEFAULT 'Equipe de Campo',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Insert Statuses
    console.log('🎨 Inserting activity statuses...');
    const statuses = [
      { name: 'Não iniciado', color: '#94A3B8', order_index: 1 },
      { name: 'Em andamento', color: '#EAB308', order_index: 2 },
      { name: 'Concluído', color: '#10B981', order_index: 3 },
      { name: 'Atrasado', color: '#EF4444', order_index: 4 },
      { name: 'Prorrogado', color: '#F97316', order_index: 5 },
      { name: 'Suspenso', color: '#8B5CF6', order_index: 6 },
      { name: 'Não aplicável', color: '#64748B', order_index: 7 },
    ];
    for (const s of statuses) {
      await client.query(
        'INSERT INTO activity_statuses (name, color, order_index) VALUES ($1, $2, $3)',
        [s.name, s.color, s.order_index]
      );
    }

    // 3. Insert Settings
    console.log('⚙️ Inserting project settings...');
    const settings = [
      { key: 'project_name', value: 'PRAD Conjunto Eólico Umburanas', label: 'Nome do Projeto', group: 'Geral' },
      { key: 'client', value: 'ENGIE', label: 'Contratante / Empreendimento', group: 'Geral' },
      { key: 'executor', value: 'EcoBrasil Consultoria Ambiental', label: 'Responsável Operacional', group: 'Geral' },
      { key: 'total_areas', value: '38', label: 'Total de Áreas PRAD', group: 'Métricas' },
      { key: 'total_area_ha', value: '50.26', label: 'Área Total (ha)', group: 'Métricas' },
      { key: 'canteiro_ha', value: '3.46', label: 'Área do Canteiro Principal (ha)', group: 'Métricas' },
      { key: 'base_date', value: '2026-08-05', label: 'Data Base', group: 'Datas' },
      { key: 'contractual_end', value: '2026-08-31', label: 'Fim Contratual', group: 'Datas' },
      { key: 'periodicity_days', value: '15', label: 'Periodicidade de Atualização (dias)', group: 'Datas' },
      { key: 'epsg', value: '31984', label: 'Sistema de Referência EPSG', group: 'GIS' },
      { key: 'utm_zone', value: '24S', label: 'Zona UTM', group: 'GIS' },
      { key: 'datum', value: 'SIRGAS 2000', label: 'Datum', group: 'GIS' },
    ];
    for (const st of settings) {
      await client.query(
        'INSERT INTO project_settings (key, value, label, "group") VALUES ($1, $2, $3, $4)',
        [st.key, st.value, st.label, st.group]
      );
    }

    // 4. Insert Demo Users
    console.log('👤 Inserting demo users...');
    const users = [
      { name: 'Administrador EcoBrasil', email: 'admin@ecobrasil.com.br', role: 'Administrador' },
      { name: 'Gestor ENGIE', email: 'gestor@engie.com.br', role: 'Gestor' },
      { name: 'Técnico de Campo', email: 'campo@ecobrasil.com.br', role: 'Equipe de Campo' },
      { name: 'Auditor de Consulta', email: 'consulta@engie.com.br', role: 'Consulta' },
    ];
    for (const u of users) {
      await client.query(
        'INSERT INTO users (name, email, role) VALUES ($1, $2, $3)',
        [u.name, u.email, u.role]
      );
    }

    // 5. Read PRAD Excel workbook
    const pradExcelPath = path.join(BASE_DIR, 'PRAD_CEUR_ENGIE 2026 Execução (1).xlsx');
    console.log(`📊 Reading PRAD Excel from ${pradExcelPath}...`);
    const wbPrad = xlsx.readFile(pradExcelPath, { cellDates: true });

    // Load area points shapefile GeoJSON for matching lat/lng
    const shpPradPointsPath = path.join(BASE_DIR, 'public/data/layers/areas_prad_eco_38_areas.geojson');
    let shpPradMap: Record<string, { lat: number; lng: number }> = {};
    if (fs.existsSync(shpPradPointsPath)) {
      const geojson = JSON.parse(fs.readFileSync(shpPradPointsPath, 'utf8'));
      for (const feat of geojson.features) {
        const areaName = feat.properties['Área_Para'];
        if (areaName && feat.geometry && feat.geometry.coordinates) {
          const [lng, lat] = feat.geometry.coordinates;
          shpPradMap[areaName.toLowerCase()] = { lat, lng };
        }
      }
    }

    // 5a. Import Controle Integrado & Base Áreas
    const sheetControle = wbPrad.Sheets['Controle Integrado'];
    const dataControle = xlsx.utils.sheet_to_json<any[]>(sheetControle, { header: 1 });
    const sheetBase = wbPrad.Sheets['Base Áreas'];
    const dataBase = xlsx.utils.sheet_to_json<any[]>(sheetBase, { header: 1 });

    console.log('📍 Importing 38 PRAD areas...');
    // Header is on row index 2 (row 3 in Excel)
    for (let i = 3; i < dataControle.length; i++) {
      const row = dataControle[i];
      if (!row || !row[0] || typeof row[0] !== 'number') continue;

      const num = row[0];
      const windComplex = row[1] ? String(row[1]).trim() : null;
      const name = row[2] ? String(row[2]).trim() : `Área ${num}`;
      const areaHa = parseFloat(row[3]) || 0;
      const actionType = row[4] ? String(row[4]).trim() : null;
      const soilCollectionStatus = row[5] ? String(row[5]).trim() : 'Não iniciado';
      const soilCollectionDate = row[6] ? new Date(row[6]) : null;
      const maintenanceStatus = row[7] ? String(row[7]).trim() : 'Não iniciado';
      const maintenanceDate = row[8] ? new Date(row[8]) : null;
      const irrigationStatus = row[9] ? String(row[9]).trim() : 'Não iniciado';
      const irrigationDate = row[10] ? new Date(row[10]) : null;
      const operationalMonitoring = row[11] ? String(row[11]).trim() : 'Não iniciado';
      const ecologicalMonitoring = row[12] ? String(row[12]).trim() : 'Não iniciado';
      const responsible = row[13] ? String(row[13]).trim() : 'Equipe de Campo';
      const status = row[14] ? String(row[14]).trim() : 'Concluído';
      const completionPct = typeof row[15] === 'number' ? row[15] : (status === 'Concluído' ? 1.0 : 0);
      const startDate = row[16] ? new Date(row[16]) : null;
      const plannedEndDate = row[17] ? new Date(row[17]) : null;
      const realEndDate = row[18] ? new Date(row[18]) : null;
      const newDate = row[19] ? new Date(row[19]) : null;
      const remainingDays = typeof row[20] === 'number' ? row[20] : null;
      const notes = row[21] ? String(row[21]).trim() : null;

      // Find match in Base Áreas for fortnight/pending
      let fortnight: string | null = null;
      let resultProtocol: string | null = null;
      let pendingIssue: string | null = null;
      let extensionDate: Date | null = null;

      for (let j = 3; j < dataBase.length; j++) {
        const bRow = dataBase[j];
        if (bRow && (bRow[0] === `Área ${num.toString().padStart(2, '0')}` || bRow[0] === `Área ${num}`)) {
          fortnight = bRow[7] ? String(bRow[7]).trim() : null;
          resultProtocol = bRow[8] ? String(bRow[8]).trim() : null;
          pendingIssue = bRow[9] ? String(bRow[9]).trim() : null;
          extensionDate = bRow[11] ? new Date(bRow[11]) : null;
          break;
        }
      }

      // Check spatial match from SHP
      let lat: number | null = null;
      let lng: number | null = null;
      const shpMatch = shpPradMap[name.toLowerCase()];
      if (shpMatch) {
        lat = shpMatch.lat;
        lng = shpMatch.lng;
      }

      await client.query(`
        INSERT INTO prad_areas (
          number, wind_complex, name, area_ha, action_type,
          soil_collection_status, soil_collection_date, maintenance_status, maintenance_date,
          irrigation_status, irrigation_date, operational_monitoring, ecological_monitoring,
          responsible, status, completion_pct, start_date, planned_end_date, real_end_date,
          new_date, remaining_days, notes, fortnight, result_protocol, pending_issue, extension_date,
          lat, lng
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        );
      `, [
        num, windComplex, name, areaHa, actionType,
        soilCollectionStatus, soilCollectionDate, maintenanceStatus, maintenanceDate,
        irrigationStatus, irrigationDate, operationalMonitoring, ecologicalMonitoring,
        responsible, status, completionPct, startDate, plannedEndDate, realEndDate,
        newDate, remainingDays, notes, fortnight, resultProtocol, pendingIssue, extensionDate,
        lat, lng
      ]);
    }

    // 5b. Import Planejamento
    console.log('📋 Importing Planning items...');
    const sheetPlan = wbPrad.Sheets['Planejamento'];
    const dataPlan = xlsx.utils.sheet_to_json<any[]>(sheetPlan, { header: 1 });
    for (let i = 3; i < dataPlan.length; i++) {
      const row = dataPlan[i];
      if (!row || row[0] === undefined || typeof row[0] !== 'number') continue;

      const code = row[0];
      const activity = row[1] ? String(row[1]).trim() : '';
      const unit = row[2] ? String(row[2]).trim() : '';
      const targetMetric = parseFloat(row[3]) || 0;
      const startDate = row[4] ? new Date(row[4]) : null;
      const plannedEndDate = row[5] ? new Date(row[5]) : null;
      const realEndDate = row[6] ? new Date(row[6]) : null;
      const newDate = row[7] ? new Date(row[7]) : null;
      const responsible = row[8] ? String(row[8]).trim() : 'Equipe de Campo';
      const status = row[9] ? String(row[9]).trim() : 'Em andamento';
      const completionPct = parseFloat(row[10]) || 0;
      const executed = parseFloat(row[11]) || 0;
      const remaining = parseFloat(row[12]) || 0;
      const notes = row[13] ? String(row[13]).trim() : null;

      await client.query(`
        INSERT INTO planning_items (
          code, activity, unit, target_metric, start_date, planned_end_date, real_end_date, new_date,
          responsible, status, completion_pct, executed, remaining, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
      `, [
        code, activity, unit, targetMetric, startDate, plannedEndDate, realEndDate, newDate,
        responsible, status, completionPct, executed, remaining, notes
      ]);
    }

    // 5c. Import Cronograma 2026-2028
    console.log('📅 Importing Macro Schedule items...');
    const sheetSched = wbPrad.Sheets['Cronograma 2026-2028'];
    const dataSched = xlsx.utils.sheet_to_json<any[]>(sheetSched, { header: 1 });
    for (let i = 2; i < dataSched.length - 1; i++) {
      const row = dataSched[i];
      if (!row || row[0] === undefined || typeof row[0] !== 'number') continue;

      const code = row[0];
      const activity = row[1] ? String(row[1]).trim() : '';
      const plannedStart = row[2] ? new Date(row[2]) : null;
      const plannedEnd = row[3] ? new Date(row[3]) : null;
      const realEnd = row[4] ? new Date(row[4]) : null;
      const newDate = row[5] ? new Date(row[5]) : null;
      const status = row[6] ? String(row[6]).trim() : 'Não iniciado';

      await client.query(`
        INSERT INTO schedule_items (
          code, activity, planned_start, planned_end, real_end, new_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [
        code, activity, plannedStart, plannedEnd, realEnd, newDate, status
      ]);
    }

    // 6. Import Photos Excel & FIGURAS
    const photoExcelPath = path.join(BASE_DIR, 'Informacoes_extraidas_fotografias_campo.xlsx');
    console.log(`📷 Reading field photo records from ${photoExcelPath}...`);
    const wbPhotos = xlsx.readFile(photoExcelPath, { cellDates: true });
    const sheetPhotos = wbPhotos.Sheets['Dados extraídos'];
    const dataPhotos = xlsx.utils.sheet_to_json<any[]>(sheetPhotos, { header: 1 });

    // Rows start at index 4 (row 5 in Excel)
    for (let i = 4; i < dataPhotos.length; i++) {
      const row = dataPhotos[i];
      if (!row || !row[0]) continue;

      const fileName = String(row[0]).trim();
      const rawDate = row[1] ? new Date(row[1]) : null;
      const horaStr = row[2] ? String(row[2]).trim() : null;

      // Construct date+time if present
      let capturedAt = rawDate;
      if (rawDate && horaStr && horaStr.includes(':')) {
        const parts = horaStr.split(':');
        capturedAt = new Date(rawDate);
        capturedAt.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, parseInt(parts[2], 10) || 0);
      }

      const utmZone = row[3] ? String(row[3]).trim() : null;
      const easting = row[4] && typeof row[4] === 'number' ? row[4] : null;
      const northing = row[5] && typeof row[5] === 'number' ? row[5] : null;
      const code = row[6] ? String(row[6]).trim() : null;
      const local = row[7] ? String(row[7]).trim() : null;
      const activity = row[8] ? String(row[8]).trim() : null;
      const notes = row[9] ? String(row[9]).trim() : null;
      const confidence = row[10] ? String(row[10]).trim() : 'Alta';

      let isGeoreferenced = false;
      let lat: number | null = null;
      let lng: number | null = null;

      if (easting && northing && utmZone) {
        try {
          // EPSG:31984 -> EPSG:4326
          const [lonRes, latRes] = proj4('EPSG:31984', 'EPSG:4326', [easting, northing]);
          lat = latRes;
          lng = lonRes;
          isGeoreferenced = true;
        } catch (err) {
          console.warn(`Failed coordinate transformation for photo ${fileName}:`, err);
        }
      }

      // Ignore non-georeferenced photos without coordinates
      if (!isGeoreferenced) {
        console.log(`Skipping photo without coordinates: ${fileName}`);
        continue;
      }

      const storagePath = `/uploads/photos/${fileName}`;

      await client.query(`
        INSERT INTO photos (
          file_name, storage_path, mime_type, captured_at, hora, utm_zone, easting, northing,
          lat, lng, code, local, activity, notes, confidence, is_georeferenced
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        );
      `, [
        fileName, storagePath, 'image/jpeg', capturedAt, horaStr, utmZone, easting, northing,
        lat, lng, code, local, activity, notes, confidence, isGeoreferenced
      ]);
    }

    // 7. Audit log for ETL run
    await client.query(`
      INSERT INTO audit_logs (user_name, action, entity, field_name, new_value)
      VALUES ('Sistema ETL', 'IMPORT', 'DATABASE', 'ALL', 'Carga inicial de dados concluída com sucesso');
    `);

    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Error during database migration:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
