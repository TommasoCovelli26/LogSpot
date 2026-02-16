// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from 'next/server';
// Importa la libreria better-sqlite3 per interagire con il database SQLite
import Database from 'better-sqlite3';
// Importa il modulo 'path' di Node.js per costruire percorsi di file cross-platform
import path from 'path';

// Costruisce il percorso assoluto al file del database SQLite
const dbPath = path.join(process.cwd(), 'app/data/database.db');

/**
 * Handler GET per l'endpoint /api/esercizi/[id]
 * Recupera i dettagli completi di un esercizio specifico, inclusi i dati dell'attività associata.
 * Il parametro [id] viene estratto dall'URL dinamico.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // Parametri dinamici dell'URL (id dell'esercizio)
) {
  try {
    // Estrae l'id dell'esercizio dai parametri dinamici della route (await perché è una Promise)
    const { id } = await params;

    // Apre una connessione al database SQLite
    const db = new Database(dbPath);

    // Prepara la query SQL: seleziona i dettagli dell'esercizio con INNER JOIN su Attivita
    // per ottenere anche titolo, descrizione, istruzioni, immagine, fasciaEta e patologie dell'attività
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

    // Esegue la query e recupera il singolo risultato (get restituisce una sola riga)
    const exercise = stmt.get(id);

    // Se l'esercizio non è stato trovato, restituisce errore 404
    if (!exercise) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    // Restituisce i dettagli dell'esercizio come risposta JSON
    return NextResponse.json(exercise);
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'esercizio' },
      { status: 500 }
    );
  }
}

/**
 * Handler PATCH per l'endpoint /api/esercizi/[id]
 * Aggiorna parzialmente un esercizio: stato di completamento e/o durata.
 * Supporta aggiornamento di uno o entrambi i campi.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // Parametri dinamici dell'URL (id dell'esercizio)
) {
  try {
    // Estrae l'id dell'esercizio dai parametri dinamici della route
    const { id } = await params;
    // Legge il corpo della richiesta JSON contenente i campi da aggiornare
    const body = await request.json();
    // Array per accumulare le clausole SET della query UPDATE
    const updates: string[] = [];
    // Array per accumulare i valori dei parametri della query
    const paramsList: Array<string | number | null> = [];

    // Se il body contiene il campo 'statoCompletamento', lo aggiunge alla lista degli aggiornamenti
    if (Object.prototype.hasOwnProperty.call(body, 'statoCompletamento')) {
      updates.push('statoCompletamento = ?');
      // Usa il valore fornito o null se non definito
      paramsList.push(body.statoCompletamento ?? null);
    }

    // Se il body contiene il campo 'durata', lo aggiunge alla lista degli aggiornamenti
    if (Object.prototype.hasOwnProperty.call(body, 'durata')) {
      updates.push('durata = ?');
      // Usa il valore fornito o null se non definito
      paramsList.push(body.durata ?? null);
    }

    // Se nessun campo valido è stato fornito, restituisce errore 400
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Nessun campo da aggiornare' },
        { status: 400 }
      );
    }

    // Apre una connessione al database SQLite
    const db = new Database(dbPath);

    // Costruisce e prepara la query UPDATE dinamica con le clausole SET accumulate
    // Le clausole vengono unite con virgola e l'id viene aggiunto come ultimo parametro per il WHERE
    const stmt = db.prepare(`
      UPDATE Esercizio
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    // Esegue la query con i parametri (valori da aggiornare + id dell'esercizio)
    const result = stmt.run(...paramsList, id);

    // Se nessuna riga è stata aggiornata, l'esercizio non esiste
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Esercizio non trovato' },
        { status: 404 }
      );
    }

    // Restituisce successo con messaggio informativo
    return NextResponse.json({ 
      success: true,
      message: 'Stato aggiornato con successo' 
    });
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dello stato' },
      { status: 500 }
    );
  }
}
