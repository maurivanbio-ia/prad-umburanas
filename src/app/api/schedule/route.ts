import { NextResponse } from 'next/server';
import { pool } from '@/database/db';
import { EXCEL_SCHEDULE_ITEMS } from '@/data/excelData';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT * FROM schedule_items ORDER BY code ASC');
    if (res.rows.length > 0) {
      return NextResponse.json({ success: true, items: res.rows });
    }
  } catch (error: any) {
    // DB query failed, fallback to Excel schedule
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }

  return NextResponse.json({ success: true, items: EXCEL_SCHEDULE_ITEMS });
}

export async function PUT(request: Request) {
  let client;
  try {
    client = await pool.connect();
    const body = await request.json();
    const { id, activity, planned_start, planned_end, real_end, new_date, status, notes } = body;

    const res = await client.query(`
      UPDATE schedule_items SET
        activity = COALESCE($1, activity),
        planned_start = COALESCE($2, planned_start),
        planned_end = COALESCE($3, planned_end),
        real_end = COALESCE($4, real_end),
        new_date = COALESCE($5, new_date),
        status = COALESCE($6, status),
        notes = COALESCE($7, notes)
      WHERE id = $8
      RETURNING *;
    `, [activity, planned_start, planned_end, real_end, new_date, status, notes, id]);

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    try { if (client) client.release(); } catch (e) {}
  }
}
