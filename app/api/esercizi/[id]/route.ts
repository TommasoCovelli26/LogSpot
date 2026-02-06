import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Percorso database
const dbPath = path.join(process.cwd(), 'app/data/database.db');

// GET - Recupera dettagli esercizio specifico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = new Database(dbPath);

    const stmt = db.prepare(`
      SELECT 
        E.id,
        E.dataAssegnazione,
        E.statoCompletamento,
        E.durata,
        E.esito,
        A.titolo,
        A.descrizione,
        A.istruzioni,
        A.immagine,
        A.fasciaEta,
        A.patologie
      FROM Esercizio E
      INNER JOIN Attivita A ON E.id_attivita = A.cod
      WHERE E.id = ?
    `);

    const exercise = stmt.get(id);

    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'esercizio' },
      { status: 500 }
    );
  }
}

// PATCH - Aggiorna stato completamento esercizio
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updates: string[] = [];
    const paramsList: Array<string | number | null> = [];

    if (Object.prototype.hasOwnProperty.call(body, 'statoCompletamento')) {
      updates.push('statoCompletamento = ?');
      paramsList.push(body.statoCompletamento ?? null);
    }

    if (Object.prototype.hasOwnProperty.call(body, 'durata')) {
      updates.push('durata = ?');
      paramsList.push(body.durata ?? null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo da aggiornare' },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Aggiorna lo stato dell'esercizio
    const stmt = db.prepare(`
      UPDATE Esercizio
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...paramsList, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Stato aggiornato con successo' 
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dello stato' },
      { status: 500 }
    );
  }
}
