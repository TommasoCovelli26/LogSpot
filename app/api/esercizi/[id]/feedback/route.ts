// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';
// Importa NextRequest e NextResponse da Next.js per gestire richieste e risposte HTTP
import { NextRequest, NextResponse } from 'next/server';
// Importa la funzione cookies per accedere ai cookie HTTP (non utilizzata direttamente in questo file)
import { cookies } from 'next/headers';

/**
 * Handler GET per l'endpoint /api/esercizi/[id]/feedback
 * Recupera tutti i feedback associati a un esercizio specifico.
 * Il parametro [id] rappresenta l'ID dell'esercizio.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Parametri dinamici dell'URL (id dell'esercizio)
) {
  try {
    // Estrae l'id dell'esercizio dai parametri dinamici della route
    const { id } = await params;
    // Converte l'id da stringa a numero intero
    const exerciseId = parseInt(id);

    // Validazione: verifica che l'id sia un numero valido
    if (isNaN(exerciseId)) {
      // Restituisce errore 400 se l'ID non è un numero valido
      return NextResponse.json(
        { error: 'ID esercizio non valido' },
        { status: 400 }
      );
    }

    // Recupera tutti i feedback per l'esercizio specificato, ordinati per data decrescente
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

    // Restituisce l'array dei feedback come risposta JSON
    return NextResponse.json(feedbacks);
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Errore nel recupero dei feedback:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei feedback' },
      { status: 500 }
    );
  }
}

/**
 * Handler POST per l'endpoint /api/esercizi/[id]/feedback
 * Crea un nuovo feedback per un esercizio specifico.
 * Riceve nel body JSON il campo 'messaggio' con il testo del feedback.
 * Il paziente autore viene determinato automaticamente dall'esercizio associato.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Parametri dinamici dell'URL (id dell'esercizio)
) {
  try {
    // Estrae l'id dell'esercizio dai parametri dinamici della route
    const { id } = await params;
    // Converte l'id da stringa a numero intero
    const exerciseId = parseInt(id);

    // Validazione: verifica che l'id sia un numero valido
    if (isNaN(exerciseId)) {
      // Restituisce errore 400 se l'ID non è un numero valido
      return NextResponse.json(
        { error: 'ID esercizio non valido' },
        { status: 400 }
      );
    }

    // Legge il corpo della richiesta JSON
    const body = await request.json();
    // Estrae il campo 'messaggio' dal body
    const { messaggio } = body;

    // Validazione: verifica che il messaggio non sia vuoto o composto solo da spazi
    if (!messaggio || !messaggio.trim()) {
      // Restituisce errore 400 se il messaggio è mancante o vuoto
      return NextResponse.json(
        { error: 'Il messaggio è obbligatorio' },
        { status: 400 }
      );
    }

    // Recupera il codice fiscale del paziente associato all'esercizio
    // Il paziente viene determinato automaticamente dal record dell'esercizio nel database
    const exercise = db.prepare(`
      SELECT id_paziente 
      FROM Esercizio 
      WHERE id = ?
    `).get(exerciseId) as any;

    // Se l'esercizio non esiste nel database, restituisce errore 404
    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    // Inserisce il nuovo feedback nel database con il messaggio, il paziente e l'esercizio associato
    // La data viene impostata automaticamente dal DEFAULT CURRENT_TIMESTAMP dello schema
    const result = db.prepare(`
      INSERT INTO Feedback (messaggio, id_paziente, id_esercizio)
      VALUES (?, ?, ?)
    `).run(messaggio, exercise.id_paziente, exerciseId);

    // Recupera il feedback appena creato usando l'ID dell'ultimo inserimento
    const newFeedback = db.prepare(`
      SELECT cod, messaggio, data, id_paziente, id_esercizio
      FROM Feedback
      WHERE cod = ?
    `).get(result.lastInsertRowid) as any;

    // Restituisce il feedback creato con stato 201 (Created)
    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Errore nella creazione del feedback:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione del feedback' },
      { status: 500 }
    );
  }
}
