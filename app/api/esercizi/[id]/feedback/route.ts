import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET - Recupera i feedback per un esercizio specifico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'ID esercizio non valido' },
        { status: 400 }
      );
    }

    // Recupera i feedback per questo esercizio
    const feedbacks = db.prepare(`
      SELECT 
        F.cod,
        F.messaggio,
        F.data,
        F.id_paziente
      FROM Feedback F
      WHERE F.id_esercizio = ?
      ORDER BY F.data DESC
    `).all(exerciseId) as any[];

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Errore nel recupero dei feedback:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei feedback' },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json(
        { error: 'ID esercizio non valido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { messaggio } = body;

    if (!messaggio || !messaggio.trim()) {
      return NextResponse.json(
        { error: 'Il messaggio è obbligatorio' },
        { status: 400 }
      );
    }

    // Recupera il CF del paziente dalla sessione localStorage (lato client)
    // Per ora, recuperiamo il paziente dall'esercizio
    const exercise = db.prepare(`
      SELECT id_paziente 
      FROM Esercizio 
      WHERE id = ?
    `).get(exerciseId) as any;

    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    // Inserisci il nuovo feedback
    const result = db.prepare(`
      INSERT INTO Feedback (messaggio, id_paziente, id_esercizio)
      VALUES (?, ?, ?)
    `).run(messaggio, exercise.id_paziente, exerciseId);

    // Recupera il feedback appena creato
    const newFeedback = db.prepare(`
      SELECT cod, messaggio, data, id_paziente, id_esercizio
      FROM Feedback
      WHERE cod = ?
    `).get(result.lastInsertRowid) as any;

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione del feedback:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del feedback' },
      { status: 500 }
    );
  }
}
