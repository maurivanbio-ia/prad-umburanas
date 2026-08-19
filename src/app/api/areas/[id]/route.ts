import { NextResponse } from 'next/server';
import { pool } from '@/database/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const client = await pool.connect();
  try {
    const areaRes = await client.query('SELECT * FROM prad_areas WHERE id = $1', [params.id]);
    if (areaRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Área não encontrada' }, { status: 404 });
    }

    const area = areaRes.rows[0];

    // Find linked photos by local or area_id
    const photosRes = await client.query(`
      SELECT * FROM photos 
      WHERE area_id = $1 OR (local ILIKE $2)
      ORDER BY captured_at DESC
    `, [params.id, `%${area.name}%`]);

    // Audit logs for area
    const auditRes = await client.query(`
      SELECT * FROM audit_logs WHERE entity_id = $1 ORDER BY timestamp DESC LIMIT 20
    `, [params.id]);

    return NextResponse.json({
      success: true,
      area,
      photos: photosRes.rows,
      auditLogs: auditRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const existing = await client.query('SELECT * FROM prad_areas WHERE id = $1', [params.id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Área não encontrada' }, { status: 404 });
    }

    const oldArea = existing.rows[0];

    const {
      name, wind_complex, area_ha, action_type, soil_collection_status,
      maintenance_status, irrigation_status, responsible, status,
      completion_pct, notes, pending_issue, result_protocol
    } = body;

    const res = await client.query(`
      UPDATE prad_areas SET
        name = COALESCE($1, name),
        wind_complex = COALESCE($2, wind_complex),
        area_ha = COALESCE($3, area_ha),
        action_type = COALESCE($4, action_type),
        soil_collection_status = COALESCE($5, soil_collection_status),
        maintenance_status = COALESCE($6, maintenance_status),
        irrigation_status = COALESCE($7, irrigation_status),
        responsible = COALESCE($8, responsible),
        status = COALESCE($9, status),
        completion_pct = COALESCE($10, completion_pct),
        notes = COALESCE($11, notes),
        pending_issue = COALESCE($12, pending_issue),
        result_protocol = COALESCE($13, result_protocol),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *;
    `, [
      name, wind_complex, area_ha, action_type, soil_collection_status,
      maintenance_status, irrigation_status, responsible, status,
      completion_pct, notes, pending_issue, result_protocol, params.id
    ]);

    // Audit log
    await client.query(`
      INSERT INTO audit_logs (user_name, action, entity, entity_id, field_name, old_value, new_value)
      VALUES ('Gestor', 'UPDATE', 'prad_areas', $1, 'STATUS/METRICS', $2, $3);
    `, [params.id, oldArea.status, status || oldArea.status]);

    return NextResponse.json({ success: true, area: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}
