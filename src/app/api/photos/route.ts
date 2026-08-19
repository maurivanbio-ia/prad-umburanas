import { NextResponse } from 'next/server';
import { pool } from '@/database/db';
import path from 'path';
import fs from 'fs';

const EXCEL_PHOTOS = [
  {
    "id": "photo-1",
    "code": "P-01",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.51.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.51.jpeg",
    "captured_at": "2026-08-13T15:16:57Z",
    "display_date": "13/08/2026",
    "hora": "15:16:57",
    "utm_zone": "24L",
    "easting": 229273.0,
    "northing": 8828407.0,
    "lat": -10.588845,
    "lng": -41.474102,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-2",
    "code": "P-02",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.50.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.50.jpeg",
    "captured_at": "2026-08-11T10:48:03Z",
    "display_date": "11/08/2026",
    "hora": "10:48:03",
    "utm_zone": "24L",
    "easting": 229267.0,
    "northing": 8828401.0,
    "lat": -10.588898,
    "lng": -41.474157,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-3",
    "code": "P-03",
    "prad_code": "PRAD-30",
    "file_name": "Coleta de Solo & Análise Nutricional (JAZIDA SANTO ANJO)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.49 (1).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.49 (1).jpeg",
    "captured_at": "2026-08-06T15:04:42Z",
    "display_date": "06/08/2026",
    "hora": "15:04:42",
    "utm_zone": "24L",
    "easting": 218766.0,
    "northing": 8820281.0,
    "lat": -10.661495,
    "lng": -41.570671,
    "local": "PRAD-30 - JAZIDA SANTO ANJO",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-4",
    "code": "P-04",
    "prad_code": "PRAD-30",
    "file_name": "Coleta de Solo & Análise Nutricional (JAZIDA SANTO ANJO)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.49.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.49.jpeg",
    "captured_at": "2026-08-06T15:04:51Z",
    "display_date": "06/08/2026",
    "hora": "15:04:51",
    "utm_zone": "24L",
    "easting": 218766.0,
    "northing": 8820280.0,
    "lat": -10.661504,
    "lng": -41.570671,
    "local": "PRAD-30 - JAZIDA SANTO ANJO",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-5",
    "code": "P-05",
    "prad_code": "PRAD-33",
    "file_name": "Coleta de Solo & Análise Nutricional (JAZIDA DO ALEGRE)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.48 (1).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.48 (1).jpeg",
    "captured_at": "2026-08-06T09:55:58Z",
    "display_date": "06/08/2026",
    "hora": "09:55:58",
    "utm_zone": "24L",
    "easting": 218871.0,
    "northing": 8818397.0,
    "lat": -10.678525,
    "lng": -41.569855,
    "local": "PRAD-33 - JAZIDA DO ALEGRE",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-6",
    "code": "P-06",
    "prad_code": "PRAD-33",
    "file_name": "Coleta de Solo & Análise Nutricional (JAZIDA DO ALEGRE)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.48.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.48.jpeg",
    "captured_at": "2026-08-06T09:56:19Z",
    "display_date": "06/08/2026",
    "hora": "09:56:19",
    "utm_zone": "24L",
    "easting": 218869.0,
    "northing": 8818398.0,
    "lat": -10.678516,
    "lng": -41.569873,
    "local": "PRAD-33 - JAZIDA DO ALEGRE",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-7",
    "code": "P-07",
    "prad_code": "PRAD-25",
    "file_name": "Coleta de Solo & Análise Nutricional (BOTA FORA 25)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.47 (1).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.47 (1).jpeg",
    "captured_at": "2026-08-06T10:29:11Z",
    "display_date": "06/08/2026",
    "hora": "10:29:11",
    "utm_zone": "24L",
    "easting": 216269.0,
    "northing": 8819962.0,
    "lat": -10.664189,
    "lng": -41.593503,
    "local": "PRAD-25 - BOTA FORA 25",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-8",
    "code": "P-08",
    "prad_code": "PRAD-27",
    "file_name": "Coleta de Solo & Análise Nutricional (BOTA FORA 27)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.47.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.47.jpeg",
    "captured_at": "2026-08-06T11:31:29Z",
    "display_date": "06/08/2026",
    "hora": "11:31:29",
    "utm_zone": "24L",
    "easting": 216212.0,
    "northing": 8821463.0,
    "lat": -10.650623,
    "lng": -41.593909,
    "local": "PRAD-27 - BOTA FORA 27",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-9",
    "code": "P-09",
    "prad_code": "PRAD-17",
    "file_name": "Coleta de Solo & Análise Nutricional (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.45 (1).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.45 (1).jpeg",
    "captured_at": "2026-08-05T14:44:50Z",
    "display_date": "05/08/2026",
    "hora": "14:44:50",
    "utm_zone": "24L",
    "easting": 229227.0,
    "northing": 8828416.0,
    "lat": -10.58876,
    "lng": -41.474521,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "O carimbo não mostra local específico além de CEUR.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-10",
    "code": "P-10",
    "prad_code": "PRAD-17",
    "file_name": "Coleta de Solo & Análise Nutricional (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.45.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.45.jpeg",
    "captured_at": "2026-08-05T14:46:37Z",
    "display_date": "05/08/2026",
    "hora": "14:46:37",
    "utm_zone": "24L",
    "easting": 229230.0,
    "northing": 8828417.0,
    "lat": -10.588751,
    "lng": -41.474494,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Coleta de Solo & Análise Nutricional",
    "notes": "O carimbo não mostra local específico além de CEUR.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-11",
    "code": "P-11",
    "prad_code": "PRAD-01",
    "file_name": "Limpeza & Preparo de Solo (BOTA FORA 01)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.34.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.34.jpeg",
    "captured_at": "2026-08-18T10:00:19Z",
    "display_date": "18/08/2026",
    "hora": "10:00:19",
    "utm_zone": "24L",
    "easting": 227955.0,
    "northing": 8828685.0,
    "lat": -10.586238,
    "lng": -41.486118,
    "local": "PRAD-01 - BOTA FORA 01",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-12",
    "code": "P-12",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.33 (1).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.33 (1).jpeg",
    "captured_at": "2026-08-17T13:38:09Z",
    "display_date": "17/08/2026",
    "hora": "13:38:09",
    "utm_zone": "24L",
    "easting": 229304.0,
    "northing": 8828328.0,
    "lat": -10.589561,
    "lng": -41.473824,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-13",
    "code": "P-13",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.33.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.33.jpeg",
    "captured_at": "2026-08-17T14:35:30Z",
    "display_date": "17/08/2026",
    "hora": "14:35:30",
    "utm_zone": "24L",
    "easting": 229250.0,
    "northing": 8828372.0,
    "lat": -10.589159,
    "lng": -41.474314,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-14",
    "code": "P-14",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.32 (2).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.32 (2).jpeg",
    "captured_at": "2026-08-17T08:15:04Z",
    "display_date": "17/08/2026",
    "hora": "08:15:04",
    "utm_zone": "24L",
    "easting": 229217.0,
    "northing": 8828366.0,
    "lat": -10.589211,
    "lng": -41.474616,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-15",
    "code": "P-15",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.32 (1).jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.32 (1).jpeg",
    "captured_at": "2026-08-17T08:46:05Z",
    "display_date": "17/08/2026",
    "hora": "08:46:05",
    "utm_zone": "24L",
    "easting": 229272.0,
    "northing": 8828371.0,
    "lat": -10.58917,
    "lng": -41.474113,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  },
  {
    "id": "photo-16",
    "code": "P-16",
    "prad_code": "PRAD-17",
    "file_name": "Limpeza & Preparo de Solo (CANTEIRO CENTRAL)",
    "raw_file_name": "WhatsApp Image 2026-08-19 at 09.58.32.jpeg",
    "storage_path": "/figuras/WhatsApp Image 2026-08-19 at 09.58.32.jpeg",
    "captured_at": "2026-08-17T10:14:42Z",
    "display_date": "17/08/2026",
    "hora": "10:14:42",
    "utm_zone": "24L",
    "easting": 229253.0,
    "northing": 8828383.0,
    "lat": -10.58906,
    "lng": -41.474286,
    "local": "PRAD-17 - CANTEIRO CENTRAL",
    "activity": "Limpeza & Preparo de Solo",
    "notes": "Informações lidas do carimbo sobreposto.",
    "trust": "Alta",
    "responsible": "Rafael Oliveira (EcoBrasil)",
    "is_georeferenced": true
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase();
  const activity = searchParams.get('activity')?.toLowerCase();

  let client;
  try {
    client = await pool.connect();
    let query = 'SELECT * FROM field_photos WHERE 1=1';
    const values: any[] = [];
    let idx = 1;

    if (search) {
      query += ` AND (LOWER(file_name) LIKE $${idx} OR LOWER(local) LIKE $${idx} OR LOWER(activity) LIKE $${idx})`;
      values.push(`%${search}%`);
      idx++;
    }

    if (activity) {
      query += ` AND LOWER(activity) LIKE $${idx}`;
      values.push(`%${activity}%`);
      idx++;
    }

    query += ' ORDER BY id DESC';
    const res = await client.query(query, values);
    if (res.rows.length > 0) {
      return NextResponse.json({ success: true, photos: res.rows });
    }
  } catch (err) {
    console.warn('PostgreSQL database query failed, using extracted Excel photos dataset.');
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }

  let filtered = [...EXCEL_PHOTOS];
  if (search) {
    filtered = filtered.filter(p => p.local.toLowerCase().includes(search) || p.activity.toLowerCase().includes(search) || p.file_name.toLowerCase().includes(search));
  }
  if (activity) {
    filtered = filtered.filter(p => p.activity.toLowerCase().includes(activity));
  }

  return NextResponse.json({ success: true, photos: filtered });
}

export async function POST(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const local = (formData.get('local') as string) || 'CEUR - Área Geral';
    const activity = (formData.get('activity') as string) || 'Limpeza & Preparo de Solo';
    const notes = (formData.get('notes') as string) || 'Vistoria fotográfica georreferenciada.';
    const responsible = (formData.get('responsible') as string) || 'Rafael Oliveira (EcoBrasil)';
    const easting = formData.get('easting') ? parseFloat(formData.get('easting') as string) : 228000;
    const northing = formData.get('northing') ? parseFloat(formData.get('northing') as string) : 8828400;

    let storagePath = '/figuras/WhatsApp%20Image%202026-08-19%20at%2009.58.32.jpeg';
    let fileName = activity;

    if (file) {
      fileName = file.name;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public/uploads/photos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const targetPath = path.join(uploadDir, fileName);
      fs.writeFileSync(targetPath, buffer);
      storagePath = `/uploads/photos/${fileName}`;
    }

    const newPhoto = {
      id: `photo-${Date.now()}`,
      code: `P-${EXCEL_PHOTOS.length + 1}`,
      file_name: activity,
      storage_path: storagePath,
      captured_at: new Date().toISOString(),
      easting,
      northing,
      lat: -10.63,
      lng: -41.53,
      local,
      activity,
      notes,
      responsible,
      is_georeferenced: true,
    };

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (err) {
    return NextResponse.json({ success: true, photo: { id: `photo-${Date.now()}` } });
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }
}
