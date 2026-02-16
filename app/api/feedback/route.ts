// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';
// Importa NextRequest e NextResponse da Next.js per gestire richieste e risposte HTTP
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handler GET per l'endpoint /api/feedback
 * Recupera tutti i feedback relativi agli esercizi assegnati da un determinato logopedista.
 * Esegue un multi-JOIN su Feedback, Esercizio, Attivita e Paziente per arricchire
 * ogni feedback con il titolo dell'esercizio e il nome/cognome del paziente.
 * Parametro query string: pIva = P.IVA del logopedista
 */
export async function GET(request: NextRequest) {
  try {
    // Accede ai parametri della query string dalla richiesta
    const searchParams = request.nextUrl.searchParams;
    // Legge la P.IVA del logopedista dalla query string
    const pIva = searchParams.get('pIva');

    // Validazione: verifica che la P.IVA sia presente nella query string
    if (!pIva) {
      // Restituisce errore 400 se la P.IVA non è stata fornita
      return NextResponse.json(
        { error: 'pIva non fornita' },
        { status: 400 }
      );
    }

    // Query SQL con multi-JOIN per recuperare tutti i feedback degli esercizi assegnati dal logopedista:
    // - Feedback F: dati del feedback (messaggio, data, paziente)
    // - Esercizio E: collega il feedback all'esercizio e determina il logopedista assegnante
    // - Attivita A: fornisce il titolo dell'attività/esercizio
    // - Paziente P: fornisce nome e cognome del paziente autore del feedback
    // Filtra per il logopedista specificato e ordina per data decrescente
    const feedbacks = db.prepare(`
      SELECT 
        F.cod,
        F.messaggio,
        F.data,
        F.id_paziente,
        F.id_esercizio,
        A.titolo as titolo_esercizio,
        P.cognome as cognome_paziente,
        P.nome as nome_paziente
      FROM Feedback F
      JOIN Esercizio E ON F.id_esercizio = E.id
      JOIN Attivita A ON E.id_attivita = A.cod
      JOIN Paziente P ON F.id_paziente = P.cf
      WHERE E.id_logopedista = ?
      ORDER BY F.data DESC
    `).all(pIva) as any[];

    // Restituisce l'array dei feedback arricchiti come risposta JSON
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
