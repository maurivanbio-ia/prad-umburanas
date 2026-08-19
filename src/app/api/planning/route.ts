import { NextResponse } from 'next/server';
import { pool } from '@/database/db';
import { EXCEL_PLANNING_ITEMS } from '@/data/excelData';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT * FROM planning_items ORDER BY code ASC');
    if (res.rows.length > 0) {
      return NextResponse.json({ success: true, items: res.rows });
    }
  } catch (error: any) {
    // DB query failed, fallback to Excel planning items
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }

  return NextResponse.json({ success: true, items: EXCEL_PLANNING_ITEMS });
}

export async function PUT(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { id, activity, target_metric, executed, status, notes } = body;

    const remaining = Math.max(0, target_metric - executed);
    const completion_pct = target_metric > 0 ? Math.min(1.0, executed / target_metric) : 0;

    const res = await client.query(`
      UPDATE planning_items SET
        activity = COALESCE($1, activity),
        target_metric = COALESCE($2, target_metric),
        executed = COALESCE($3, executed),
        remaining = $4,
        completion_pct = $5,
        status = COALESCE($6, status),
        notes = COALESCE($7, notes)
      WHERE id = $8
      RETURNING *;
    `, [activity, target_metric, executed, remaining, completion_pct, status, notes, id]);

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }
}
