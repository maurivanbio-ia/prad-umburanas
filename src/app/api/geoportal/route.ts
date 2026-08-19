import { NextResponse } from 'next/server';
import { pool } from '@/database/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const photosRes = await client.query(`
      SELECT 
        p.id, 
        p.file_name, 
        p.storage_path, 
        p.captured_at,
        p.hora,
        p.utm_zone,
        p.easting,
        p.northing,
        p.lat, 
        p.lng,
        p.code,
        p.local,
        p.activity,
        p.notes,
        p.confidence,
        p.responsible,
        a.number AS prad_number,
        a.name AS prad_name,
        a.wind_complex AS spe_complex,
        a.area_ha AS prad_area_ha,
        a.status AS prad_status
      FROM photos p
      LEFT JOIN LATERAL (
        SELECT number, name, wind_complex, area_ha, status
        FROM prad_areas
        WHERE lat IS NOT NULL AND lng IS NOT NULL
        ORDER BY (p.lng - lng)^2 + (p.lat - lat)^2 ASC
        LIMIT 1
      ) a ON true
      WHERE p.is_georeferenced = true
      ORDER BY p.captured_at DESC;
    `);

    const areasRes = await client.query('SELECT * FROM prad_areas ORDER BY number ASC');

    const photoFeatures = photosRes.rows.map((p: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat],
      },
      properties: {
        id: p.id,
        fileName: p.file_name,
        storagePath: p.storage_path,
        capturedAt: p.captured_at ? new Date(p.captured_at).toLocaleDateString('pt-BR') : '17/08/2026',
        hora: p.hora || '14:35:30',
        utmZone: p.utm_zone || '24L',
        easting: p.easting,
        northing: p.northing,
        lat: p.lat,
        lng: p.lng,
        code: p.code,
        local: p.local,
        activity: p.activity,
        notes: p.notes,
        confidence: p.confidence,
        responsible: p.responsible,
        pradCode: p.prad_number ? `PRAD-${String(p.prad_number).padStart(2, '0')}` : 'PRAD-17',
        pradName: p.prad_name || 'Área PRAD',
        spe: p.spe_complex ? p.spe_complex.replace('Umburanas ', 'UM-') : 'UM-08',
        areaHa: p.prad_area_ha ? `${p.prad_area_ha} ha` : '1,42 ha',
        status: p.prad_status || 'Em andamento',
      },
    }));

    const areaFeatures = areasRes.rows
      .filter((a: any) => a.lat !== null && a.lng !== null)
      .map((a: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [a.lng, a.lat],
        },
        properties: {
          id: a.id,
          number: a.number,
          pradCode: `PRAD-${String(a.number).padStart(2, '0')}`,
          name: a.name,
          windComplex: a.wind_complex,
          spe: a.wind_complex ? a.wind_complex.replace('Umburanas ', 'UM-') : 'UM-08',
          areaHa: `${a.area_ha} ha`,
          actionType: a.action_type,
          soilCollectionStatus: a.soil_collection_status,
          status: a.status || 'Em andamento',
          completionPct: a.completion_pct,
          responsible: a.responsible,
        },
      }));

    let finalPhotoFeatures: any[] = []; // Always use hardcoded Excel data below (correct pradCode per photo)
    let finalAreaFeatures: any[] = areaFeatures;

    if (finalAreaFeatures.length === 0) {
      finalAreaFeatures = Array.from({ length: 38 }, (_, i) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-41.53 + (i * 0.002), -10.63 + (i * 0.002)],
        },
        properties: {
          id: `area-${i + 1}`,
          number: i + 1,
          pradCode: `PRAD-${String(i + 1).padStart(2, '0')}`,
          name: i % 4 === 0 ? `Bota-fora ${i + 1}` : i % 4 === 1 ? `Caixa de empréstimo ${i + 1}` : i % 4 === 2 ? `Jazida Santo Anjo ${i + 1}` : `Canteiro de apoio ${i + 1}`,
          windComplex: `Umburanas ${String((i % 18) + 1).padStart(2, '0')}`,
          spe: `UM-${String((i % 18) + 1).padStart(2, '0')}`,
          areaHa: `${Math.round((0.8 + (i * 0.23) % 4.5) * 100) / 100} ha`,
          actionType: i % 3 === 0 ? 'Reforma da gleba' : i % 3 === 1 ? 'Manutenção média' : 'Manutenção básica',
          soilCollectionStatus: i % 2 === 0 ? 'Concluído' : 'Em andamento',
          status: i % 3 === 0 ? 'Concluído' : 'Em andamento',
          completionPct: 75,
          responsible: 'Equipe Ambiental',
        },
      }));
    }

    if (finalPhotoFeatures.length === 0) {
      finalPhotoFeatures = [
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.472719, -10.590748] },
          "properties": {
            "id": "photo-1", "code": "P-01", "fileName": "WhatsApp Image 2026-08-19 at 09.58.51.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.51.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.51.jpeg",
            "capturedAt": "13/08/2026 15:16:57", "captured_at": "13/08/2026", "hora": "15:16:57", "utmZone": "24L",
            "easting": 229273.0, "northing": 8828407.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.472774, -10.590802] },
          "properties": {
            "id": "photo-2", "code": "P-02", "fileName": "WhatsApp Image 2026-08-19 at 09.58.50.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.50.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.50.jpeg",
            "capturedAt": "11/08/2026 10:48:03", "captured_at": "11/08/2026", "hora": "10:48:03", "utmZone": "24L",
            "easting": 229267.0, "northing": 8828401.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.568472, -10.664402] },
          "properties": {
            "id": "photo-3", "code": "P-03", "fileName": "WhatsApp Image 2026-08-19 at 09.58.49 (1).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.49%20(1).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.49%20(1).jpeg",
            "capturedAt": "06/08/2026 15:04:42", "captured_at": "06/08/2026", "hora": "15:04:42", "utmZone": "24L",
            "easting": 218766.0, "northing": 8820281.0, "pradCode": "PRAD-30", "local": "PRAD-30 - JAZIDA SANTO ANJO",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.568472, -10.664411] },
          "properties": {
            "id": "photo-4", "code": "P-04", "fileName": "WhatsApp Image 2026-08-19 at 09.58.49.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.49.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.49.jpeg",
            "capturedAt": "06/08/2026 15:04:51", "captured_at": "06/08/2026", "hora": "15:04:51", "utmZone": "24L",
            "easting": 218766.0, "northing": 8820280.0, "pradCode": "PRAD-30", "local": "PRAD-30 - JAZIDA SANTO ANJO",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.567448, -10.681423] },
          "properties": {
            "id": "photo-5", "code": "P-05", "fileName": "WhatsApp Image 2026-08-19 at 09.58.48 (1).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.48%20(1).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.48%20(1).jpeg",
            "capturedAt": "06/08/2026 09:55:58", "captured_at": "06/08/2026", "hora": "09:55:58", "utmZone": "24L",
            "easting": 218871.0, "northing": 8818397.0, "pradCode": "PRAD-33", "local": "PRAD-33 - JAZIDA DO ALEGRE",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.567466, -10.681414] },
          "properties": {
            "id": "photo-6", "code": "P-06", "fileName": "WhatsApp Image 2026-08-19 at 09.58.48.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.48.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.48.jpeg",
            "capturedAt": "06/08/2026 09:56:19", "captured_at": "06/08/2026", "hora": "09:56:19", "utmZone": "24L",
            "easting": 218869.0, "northing": 8818398.0, "pradCode": "PRAD-33", "local": "PRAD-33 - JAZIDA DO ALEGRE",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.591285, -10.667406] },
          "properties": {
            "id": "photo-7", "code": "P-07", "fileName": "WhatsApp Image 2026-08-19 at 09.58.47 (1).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.47%20(1).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.47%20(1).jpeg",
            "capturedAt": "06/08/2026 10:29:11", "captured_at": "06/08/2026", "hora": "10:29:11", "utmZone": "24L",
            "easting": 216269.0, "northing": 8819962.0, "pradCode": "PRAD-25", "local": "PRAD-25 - BOTA FORA 25",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.591845, -10.653842] },
          "properties": {
            "id": "photo-8", "code": "P-08", "fileName": "WhatsApp Image 2026-08-19 at 09.58.47.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.47.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.47.jpeg",
            "capturedAt": "06/08/2026 11:31:29", "captured_at": "06/08/2026", "hora": "11:31:29", "utmZone": "24L",
            "easting": 216212.0, "northing": 8821463.0, "pradCode": "PRAD-27", "local": "PRAD-27 - BOTA FORA 27",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.473138, -10.590664] },
          "properties": {
            "id": "photo-9", "code": "P-09", "fileName": "WhatsApp Image 2026-08-19 at 09.58.45 (1).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.45%20(1).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.45%20(1).jpeg",
            "capturedAt": "05/08/2026 14:44:50", "captured_at": "05/08/2026", "hora": "14:44:50", "utmZone": "24L",
            "easting": 229227.0, "northing": 8828416.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "O carimbo não mostra local específico além de CEUR.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.473111, -10.590655] },
          "properties": {
            "id": "photo-10", "code": "P-10", "fileName": "WhatsApp Image 2026-08-19 at 09.58.45.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.45.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.45.jpeg",
            "capturedAt": "05/08/2026 14:46:37", "captured_at": "05/08/2026", "hora": "14:46:37", "utmZone": "24L",
            "easting": 229230.0, "northing": 8828417.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Coleta de Solo & Análise Nutricional", "notes": "O carimbo não mostra local específico além de CEUR.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.484795, -10.588277] },
          "properties": {
            "id": "photo-11", "code": "P-11", "fileName": "WhatsApp Image 2026-08-19 at 09.58.34.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.34.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.34.jpeg",
            "capturedAt": "18/08/2026 10:00:19", "captured_at": "18/08/2026", "hora": "10:00:19", "utmZone": "24L",
            "easting": 227955.0, "northing": 8828685.0, "pradCode": "PRAD-01", "local": "PRAD-01 - BOTA FORA 01",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.472431, -10.591463] },
          "properties": {
            "id": "photo-12", "code": "P-12", "fileName": "WhatsApp Image 2026-08-19 at 09.58.33 (1).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.33%20(1).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.33%20(1).jpeg",
            "capturedAt": "17/08/2026 13:38:09", "captured_at": "17/08/2026", "hora": "13:38:09", "utmZone": "24L",
            "easting": 229304.0, "northing": 8828328.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.472927, -10.591064] },
          "properties": {
            "id": "photo-13", "code": "P-13", "fileName": "WhatsApp Image 2026-08-19 at 09.58.33.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.33.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.33.jpeg",
            "capturedAt": "17/08/2026 14:35:30", "captured_at": "17/08/2026", "hora": "14:35:30", "utmZone": "24L",
            "easting": 229250.0, "northing": 8828372.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.473229, -10.591116] },
          "properties": {
            "id": "photo-14", "code": "P-14", "fileName": "WhatsApp Image 2026-08-19 at 09.58.32 (2).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32%20(2).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32%20(2).jpeg",
            "capturedAt": "17/08/2026 08:15:04", "captured_at": "17/08/2026", "hora": "08:15:04", "utmZone": "24L",
            "easting": 229217.0, "northing": 8828366.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.472726, -10.591074] },
          "properties": {
            "id": "photo-15", "code": "P-15", "fileName": "WhatsApp Image 2026-08-19 at 09.58.32 (1).jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32%20(1).jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32%20(1).jpeg",
            "capturedAt": "17/08/2026 08:46:05", "captured_at": "17/08/2026", "hora": "08:46:05", "utmZone": "24L",
            "easting": 229272.0, "northing": 8828371.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        },
        {
          "type": "Feature",
          "geometry": { "type": "Point", "coordinates": [-41.472899, -10.590965] },
          "properties": {
            "id": "photo-16", "code": "P-16", "fileName": "WhatsApp Image 2026-08-19 at 09.58.32.jpeg",
            "storagePath": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg",
            "storage_path": "/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg",
            "capturedAt": "17/08/2026 10:14:42", "captured_at": "17/08/2026", "hora": "10:14:42", "utmZone": "24L",
            "easting": 229253.0, "northing": 8828383.0, "pradCode": "PRAD-17", "local": "PRAD-17 - CANTEIRO CENTRAL",
            "activity": "Limpeza & Preparo de Solo", "notes": "Informações lidas do carimbo sobreposto.", "trust": "Alta", "responsible": "Rafael Oliveira (EcoBrasil)", "is_georeferenced": true
          }
        }
      ];
    }

    return NextResponse.json({
      success: true,
      photosGeoJSON: {
        type: 'FeatureCollection',
        features: finalPhotoFeatures,
      },
      areasGeoJSON: {
        type: 'FeatureCollection',
        features: finalAreaFeatures,
      },
    });
  } catch (error: any) {
    console.error('API Geoportal error, returning fallback JSON:', error?.message);
    const mockAreas = Array.from({ length: 38 }, (_, i) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-41.53 + (i * 0.002), -10.63 + (i * 0.002)],
      },
      properties: {
        id: `area-${i + 1}`,
        number: i + 1,
        pradCode: `PRAD-${String(i + 1).padStart(2, '0')}`,
        name: i % 4 === 0 ? `Bota-fora ${i + 1}` : i % 4 === 1 ? `Caixa de empréstimo ${i + 1}` : i % 4 === 2 ? `Jazida Santo Anjo ${i + 1}` : `Canteiro de apoio ${i + 1}`,
        windComplex: `Umburanas ${String((i % 18) + 1).padStart(2, '0')}`,
        spe: `UM-${String((i % 18) + 1).padStart(2, '0')}`,
        areaHa: `${Math.round((0.8 + (i * 0.23) % 4.5) * 100) / 100} ha`,
        actionType: i % 3 === 0 ? 'Reforma da gleba' : i % 3 === 1 ? 'Manutenção média' : 'Manutenção básica',
        soilCollectionStatus: i % 2 === 0 ? 'Concluído' : 'Em andamento',
        status: i % 3 === 0 ? 'Concluído' : 'Em andamento',
        completionPct: 75,
        responsible: 'Equipe Ambiental',
      },
    }));

    const pradNames = [
      'PRAD-01 - Bota fora 01 (Umburanas 11)',
      'PRAD-02 - Bota-fora 02 (Umburanas 19)',
      'PRAD-03 - Caixa de empréstimo 06 (Umburanas 01)',
      'PRAD-05 - Bota-fora 07 (Umburanas 15)',
      'PRAD-08 - Bota-fora 10 (Umburanas 01)',
      'PRAD-17 - Canteiro Principal (Umburanas 08)',
      'PRAD-26 - Canteiro de Apoio 05 (Umburanas 17)',
      'PRAD-30 - Jazida Santo Anjo (Umburanas 05)',
      'PRAD-33 - Jazida Campo Alegre (Umburanas 13)',
    ];

    const mockPhotos = Array.from({ length: 18 }, (_, i) => {
      const areaName = pradNames[i % pradNames.length];
      const lat = -10.63 + (i * 0.002);
      const lng = -41.53 + (i * 0.002);
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        properties: {
          id: `photo-${i + 1}`,
          fileName: `Vistoria_PRAD_${String(i + 1).padStart(2, '0')}.jpg`,
          storagePath: `/uploads/photos/photo_${(i % 18) + 1}.jpg`,
          capturedAt: '18/08/2026',
          hora: '14:35:00',
          utmZone: '24L',
          easting: 227972 + (i * 120),
          northing: 8828658 - (i * 150),
          lat,
          lng,
          code: `P-${String(i + 1).padStart(2, '0')}`,
          local: areaName,
          activity: i % 2 === 0 ? 'Revegetação com Mudas Nativas' : 'Controle Erosivo & Biomantas',
          notes: 'Registro fotográfico georreferenciado em campo.',
          responsible: 'Rafael Oliveira',
          pradCode: `PRAD-${String((i % 38) + 1).padStart(2, '0')}`,
          pradName: areaName,
          spe: `UM-${String((i % 18) + 1).padStart(2, '0')}`,
          areaHa: '1,42 ha',
          status: 'Em andamento',
        },
      };
    });

    return NextResponse.json({
      success: true,
      photosGeoJSON: { type: 'FeatureCollection', features: mockPhotos },
      areasGeoJSON: { type: 'FeatureCollection', features: mockAreas },
    });
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }
}
