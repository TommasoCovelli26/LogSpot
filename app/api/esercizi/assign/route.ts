import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cf = body.cf;
    const id_attivita = Number(body.id_attivita);
    const pIva = body.pIva || null;

    if (!cf || !id_attivita || !pIva) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    // Inserisce un nuovo esercizio (nessun controllo pregresso su id_attivita)
    const stmt = db.prepare(`
      INSERT INTO Esercizio (dataAssegnazione, statoCompletamento, durata, esito, id_attivita, id_logopedista, id_paziente)
      VALUES (DATE('now'), 'non iniziato', 0, 'nullo', ?, ?, ?)
    `);

    try {
      const info = stmt.run(id_attivita, pIva, cf);
      return NextResponse.json({ success: true, id: info.lastInsertRowid });
    } catch (err: any) {
      console.error('DB insert error', err);
      return NextResponse.json({ error: err.message || 'Errore DB' }, { status: 500 });
    }
  } catch (error) {
    console.error('Errore parsing body', error);
    return NextResponse.json({ error: 'Corpo richiesta non valido' }, { status: 400 });
  }
}
