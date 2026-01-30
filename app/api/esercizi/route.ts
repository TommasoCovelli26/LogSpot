import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf');
  const pIva = searchParams.get('pIva');

  if (!cf || !pIva) {
    return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
  }

  // Query con JOIN per avere il titolo dell'attività associata [cite: 9, 608]
  const stmt = db.prepare(`
    SELECT E.id, E.dataAssegnazione, E.statoCompletamento, E.esito, A.titolo
    FROM Esercizio E
    JOIN Attivita A ON E.id_attivita = A.cod
    WHERE E.id_paziente = ? AND E.id_logopedista = ?
    ORDER BY E.dataAssegnazione DESC
  `);

  const rows = stmt.all(cf, pIva);
  return NextResponse.json(rows);
}