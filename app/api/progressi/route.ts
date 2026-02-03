import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf');


  if (!cf) {
    return NextResponse.json({ error: 'Codice Fiscale mancante' }, { status: 400 });
  }

  // Selezioniamo gli esercizi del paziente unendoli alla tabella Attivita per il titolo
  const stmt = db.prepare(`
    SELECT E.*, A.titolo
    FROM Esercizio E
    JOIN Attivita A ON E.id_attivita = A.cod
    WHERE E.id_paziente = ?
    ORDER BY E.dataAssegnazione DESC
  `);

  const rows = stmt.all(cf);
  return NextResponse.json(rows);
}