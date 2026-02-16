// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';
// Importa NextRequest e NextResponse da Next.js per gestire richieste e risposte HTTP
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handler GET per l'endpoint /api/esercizi/assign/[id]
 * Recupera la lista dei codici fiscali (CF) dei pazienti a cui una specifica attività
 * è già stata assegnata come esercizio da un determinato logopedista.
 * Parametro URL: [id] = ID dell'attività
 * Parametro query string: pIva = P.IVA del logopedista
 * Usato per determinare quali pazienti hanno già l'esercizio assegnato (es. per disabilitare
 * il pulsante di assegnazione nella UI).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Parametri dinamici dell'URL (id dell'attività)
) {
  try {
    // Estrae l'id dell'attività dai parametri dinamici della route
    const { id } = await params;
    // Converte l'id da stringa a numero intero
    const activityId = parseInt(id);
    // Accede ai parametri della query string dalla richiesta
    const searchParams = request.nextUrl.searchParams;
    // Legge la P.IVA del logopedista dalla query string
    const pIva = searchParams.get('pIva');

    // Validazione: verifica che l'id sia un numero valido
    if (isNaN(activityId)) {
      // Restituisce errore 400 se l'ID dell'attività non è un numero valido
      return NextResponse.json(
        { error: 'ID attività non valido' },
        { status: 400 }
      );
    }

    // Validazione: verifica che la P.IVA sia presente nella query string
    if (!pIva) {
      // Restituisce errore 400 se la P.IVA non è stata fornita
      return NextResponse.json(
        { error: 'pIva non fornita' },
        { status: 400 }
      );
    }

    // Recupera i codici fiscali (DISTINCT) dei pazienti a cui l'attività è già assegnata
    // dal logopedista corrente, dalla tabella Esercizio
    const assignedPatients = db.prepare(`
      SELECT DISTINCT E.id_paziente
      FROM Esercizio E
      WHERE E.id_attivita = ? AND E.id_logopedista = ?
    `).all(activityId, pIva) as any[];

    // Mappa i risultati in un array di stringhe contenente solo i codici fiscali
    const assignedCFs = assignedPatients.map(p => p.id_paziente);

    // Restituisce l'array dei CF dei pazienti già assegnati come risposta JSON
    return NextResponse.json({ assignedCFs });
  } catch (error) {
    // Logga l'errore e restituisce errore 500
    console.error('Errore nel recupero delle assegnazioni:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle assegnazioni' },
      { status: 500 }
    );
  }
}
