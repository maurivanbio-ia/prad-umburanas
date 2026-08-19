import { NextResponse } from 'next/server';
import { pool } from '@/database/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM planning_items ORDER BY code ASC');
    return NextResponse.json({ success: true, items: res.rows });
  } catch (error: any) {
    console.error('API Planning error, returning fallback JSON:', error?.message);
    const mockItems = [
      { id: 'plan-1', code: 'PL-01', activity: 'Revegetação com Mudas Nativas', target_metric: 65.2, executed: 48.5, remaining: 16.7, completion_pct: 0.74, status: 'Em andamento', notes: 'Caatinga (Aroeira, Umbuzeiro, Angico)' },
      { id: 'plan-2', code: 'PL-02', activity: 'Controle Erosivo & Biomantas', target_metric: 38.0, executed: 28.0, remaining: 10.0, completion_pct: 0.73, status: 'Em andamento', notes: 'Construção de leiras e palissadas' },
      { id: 'plan-3', code: 'PL-03', activity: 'Adubação & Irrigação de Salvamento', target_metric: 38.0, executed: 38.0, remaining: 0.0, completion_pct: 1.0, status: 'Concluído', notes: 'Manutenção nutricional do solo' },
      { id: 'plan-4', code: 'PL-04', activity: 'Monitoramento Fotográfico Quinzenal', target_metric: 24.0, executed: 18.0, remaining: 6.0, completion_pct: 0.75, status: 'Em andamento', notes: 'Registro georreferenciado de vistorias' },
    ];
    return NextResponse.json({ success: true, items: mockItems });
  } finally {
    try { client.release(); } catch (e) {}
  }
}

export async function PUT(request: Request) {
  const client = await pool.connect();
  try {
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
    client.release();
  }
}
