import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pIva = searchParams.get('pIva');
  const format = (searchParams.get('format') || 'csv').toLowerCase();

  if (!pIva) {
    return NextResponse.json({ error: 'Missing pIva query parameter' }, { status: 400 });
  }

  const stmt = db.prepare(`
    SELECT cf, nome, cognome, dataNascita, numTelefono, email
    FROM Paziente
    WHERE id_logopedista = ?
  `);

  const rows = stmt.all(pIva);

  if (format === 'json') {
    return NextResponse.json(rows);
  }

  // Build CSV
  const headers = ['cf', 'nome', 'cognome', 'dataNascita', 'numTelefono', 'email'];
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const csv = [headers.join(',')]
    .concat(rows.map((r: any) => headers.map((h) => escape(r[h])).join(',')))
    .join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pazienti-${pIva}.csv"`,
    },
  });
}
