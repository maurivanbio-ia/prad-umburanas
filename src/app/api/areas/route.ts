import { NextResponse } from 'next/server';
import { pool } from '@/database/db';
import { EXCEL_38_AREAS } from '@/data/excelData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') || '';

  let client;
  try {
    client = await pool.connect();
    let query = 'SELECT * FROM prad_areas WHERE 1=1';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR wind_complex ILIKE $${params.length} OR action_type ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      query += ` AND (status = $${params.length} OR soil_collection_status = $${params.length})`;
    }

    query += ' ORDER BY number ASC';

    const result = await client.query(query, params);
    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, areas: result.rows });
    }
  } catch (error: any) {
    // Database query failed, fallback to 38 real PRAD areas from Excel
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }

  let filtered = [...EXCEL_38_AREAS];
  if (search) {
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.wind_complex.toLowerCase().includes(search) ||
        a.pradCode.toLowerCase().includes(search) ||
        a.action_type.toLowerCase().includes(search)
    );
  }
  if (status) {
    filtered = filtered.filter(
      (a) => a.status === status || a.soil_collection_status === status
    );
  }

  return NextResponse.json({ success: true, areas: filtered });
}

export async function POST(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const {
      number, wind_complex, name, area_ha, action_type,
      soil_collection_status, maintenance_status, irrigation_status,
      responsible, status, notes, lat, lng
    } = body;

    const res = await client.query(`
      INSERT INTO prad_areas (
        number, wind_complex, name, area_ha, action_type,
        soil_collection_status, maintenance_status, irrigation_status,
        responsible, status, notes, lat, lng
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `, [
      number || 99, wind_complex || 'Umburanas', name || 'Nova Área PRAD', area_ha || 1.0, action_type || 'Reforma',
      soil_collection_status || 'Não iniciado', maintenance_status || 'Não iniciado', irrigation_status || 'Não iniciado',
      responsible || 'Equipe de Campo', status || 'Em andamento', notes || '', lat || null, lng || null
    ]);

    return NextResponse.json({ success: true, area: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }
}
