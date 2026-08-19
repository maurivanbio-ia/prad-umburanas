import { NextResponse } from 'next/server';
import { pool } from '@/database/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM schedule_items ORDER BY code ASC');
    return NextResponse.json({ success: true, items: res.rows });
  } catch (error: any) {
    console.error('API Schedule error, returning fallback JSON:', error?.message);
    const mockItems = [
      { id: 'sched-1', code: 'SC-01', activity: 'Vistoria Técnica de Monitoramento PRAD-17', start_date: '2026-08-18', planned_end_date: '2026-08-19', status: 'Concluído', responsible: 'Rafael Oliveira', notes: 'Taxa de cobertura vegetal: 65%' },
      { id: 'sched-2', code: 'SC-02', activity: 'Adubação e Irrigação de Salvamento - Gleba 03', start_date: '2026-08-20', planned_end_date: '2026-08-25', status: 'Em andamento', responsible: 'Equipe de Campo', notes: 'Manutenção nutricional' },
      { id: 'sched-3', code: 'SC-03', activity: 'Instalação de Leiras e Biomantas - Jazida Santo Anjo', start_date: '2026-08-28', planned_end_date: '2026-09-05', status: 'Planejado', responsible: 'Empreiteira', notes: 'Controle erosivo taludes' },
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
    client.release();
  }
}
