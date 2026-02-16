// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from 'next/server';
// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';

/**
 * Handler POST per l'endpoint /api/esercizi/assign
 * Crea un nuovo esercizio assegnando un'attività a un paziente.
 * Riceve nel body JSON: cf (codice fiscale paziente), id_attivita (ID attività), pIva (P.IVA logopedista).
 * L'esercizio viene creato con stato 'non iniziato', durata 0 e esito 'nullo'.
 */
export async function POST(req: Request) {
  try {
    // Legge il corpo della richiesta JSON
    const body = await req.json();
    // Estrae il codice fiscale del paziente dal body
    const cf = body.cf;
    // Estrae e converte l'ID dell'attività in numero
    const id_attivita = Number(body.id_attivita);
    // Estrae la P.IVA del logopedista dal body (default: null se non fornita)
    const pIva = body.pIva || null;

    // Validazione: verifica che tutti i parametri obbligatori siano presenti
    if (!cf || !id_attivita || !pIva) {
      // Restituisce errore 400 se manca almeno un parametro
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    // Prepara la query SQL per inserire un nuovo esercizio nel database
    // Imposta: data di assegnazione a oggi, stato 'non iniziato', durata 0, esito 'nullo'
    const stmt = db.prepare(`
      INSERT INTO Esercizio (dataAssegnazione, statoCompletamento, durata, esito, id_attivita, id_logopedista, id_paziente)
      VALUES (DATE('now'), 'non iniziato', 0, 'nullo', ?, ?, ?)
    `);

    try {
      // Esegue l'inserimento con i parametri: id_attivita, pIva del logopedista, cf del paziente
      const info = stmt.run(id_attivita, pIva, cf);
      // Restituisce successo con l'ID del nuovo esercizio creato
      return NextResponse.json({ success: true, id: info.lastInsertRowid });
    } catch (err: any) {
      // Logga l'errore di inserimento nel database
      console.error('DB insert error', err);
      // Restituisce errore 500 con il messaggio di errore del database
      return NextResponse.json({ error: err.message || 'Errore DB' }, { status: 500 });
    }
  } catch (error) {
    // Logga l'errore di parsing del body della richiesta
    console.error('Errore parsing body', error);
    // Restituisce errore 400 se il corpo della richiesta non è JSON valido
    return NextResponse.json({ error: 'Corpo richiesta non valido' }, { status: 400 });
  }
}
