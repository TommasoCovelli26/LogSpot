// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from 'next/server';
// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';

/**
 * Handler GET per l'endpoint /api/progressi
 * Recupera tutti gli esercizi di un paziente con il titolo dell'attività associata,
 * utile per visualizzare la pagina dei progressi del paziente.
 * Parametro query string: cf = Codice Fiscale del paziente
 */
export async function GET(req: Request) {
  // Estrae i parametri dalla query string dell'URL
  const { searchParams } = new URL(req.url);
  // Legge il codice fiscale del paziente dalla query string
  const cf = searchParams.get('cf');

  // Riga vuota intenzionale (separatore visivo)

  // Validazione: verifica che il codice fiscale sia presente
  if (!cf) {
    // Restituisce errore 400 se il CF è mancante
    return NextResponse.json({ error: 'Codice Fiscale mancante' }, { status: 400 });
  }

  // Prepara la query SQL: seleziona tutti i campi dell'esercizio più il titolo dell'attività
  // Esegue JOIN con Attivita per ottenere il titolo, filtra per il paziente e ordina per data decrescente
  const stmt = db.prepare(`
    SELECT E.*, A.titolo
    FROM Esercizio E
    JOIN Attivita A ON E.id_attivita = A.cod
    WHERE E.id_paziente = ?
    ORDER BY E.dataAssegnazione DESC
  `);

  // Esegue la query con il codice fiscale del paziente
  const rows = stmt.all(cf);
  // Restituisce l'array degli esercizi con titolo come risposta JSON
  return NextResponse.json(rows);
}