// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from 'next/server';
// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';

/**
 * Handler GET per l'endpoint /api/esercizi
 * Recupera la lista degli esercizi assegnati a un paziente.
 * Supporta due modalità:
 * - Con cf + pIva: restituisce gli esercizi assegnati da un logopedista specifico a un paziente (vista logopedista)
 * - Con solo cf: restituisce tutti gli esercizi di un paziente con supporto ricerca e filtri (vista paziente)
 * Parametri query string: cf, pIva, query (ricerca), filter (tutti/completati/in-corso)
 */
export async function GET(req: Request) {
  // Estrae i parametri dalla query string dell'URL
  const { searchParams } = new URL(req.url);
  // Legge il codice fiscale del paziente dalla query string
  const cf = searchParams.get('cf');
  // Legge la P.IVA del logopedista dalla query string (opzionale)
  const pIva = searchParams.get('pIva');
  // Legge il termine di ricerca dalla query string (default: stringa vuota)
  const query = searchParams.get('query') || '';
  // Legge il filtro di stato dalla query string (default: 'tutti')
  const filter = searchParams.get('filter') || 'tutti';

  /* =====================================================
     CASO LOGOPEDISTA (cf + pIva)
     Quando sia il CF del paziente che la P.IVA del logopedista sono forniti,
     restituisce gli esercizi assegnati da quel logopedista a quel paziente.
     ===================================================== */
  if (cf && pIva) {
    try {
      // Prepara la query SQL: seleziona gli esercizi con JOIN su Attivita per il titolo
      // Filtra per paziente (cf) e logopedista (pIva), ordina per data decrescente
      const stmt = db.prepare(`
        SELECT 
          E.id,
          A.titolo,
          E.dataAssegnazione,
          E.statoCompletamento,
          E.esito
        FROM Esercizio E
        JOIN Attivita A ON E.id_attivita = A.cod
        WHERE E.id_paziente = ?
          AND E.id_logopedista = ?
        ORDER BY E.dataAssegnazione DESC
      `);

      // Esegue la query con i parametri cf e pIva
      const rows = stmt.all(cf, pIva);
      // Restituisce l'array di esercizi come risposta JSON
      return NextResponse.json(rows);
    } catch (error) {
      // Logga l'errore e restituisce errore 500
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del logopedista' },
        { status: 500 }
      );
    }
  }

  /* =====================================================
     CASO PAZIENTE (solo cf)
     Quando solo il CF del paziente è fornito,
     restituisce tutti gli esercizi del paziente con supporto per ricerca e filtri.
     ===================================================== */
  if (cf) {
    try {
      // Query SQL base: seleziona gli esercizi con INNER JOIN su Attivita per titolo e id_attivita
      // Filtra per il paziente specificato
      let sql = `
        SELECT 
          E.id,
          A.titolo,
          E.dataAssegnazione,
          E.statoCompletamento,
          E.esito,
          E.id_attivita
        FROM Esercizio E
        INNER JOIN Attivita A ON E.id_attivita = A.cod
        WHERE E.id_paziente = ?
      `;

      // Array dei parametri per la query preparata; inizia con il codice fiscale del paziente
      const params: any[] = [cf];

      // Filtro ricerca: se è presente un termine di ricerca, aggiunge un filtro LIKE sul titolo
      if (query) {
        sql += ` AND A.titolo LIKE ?`;
        // Aggiunge il termine con wildcard per ricerca parziale
        params.push(`%${query}%`);
      }

      // Filtro stato: applica condizioni sullo stato di completamento
      if (filter === 'completati') {
        // Mostra solo gli esercizi con stato 'completato'
        sql += ` AND E.statoCompletamento = 'completato'`;
      } else if (filter === 'in-corso') {
        // Mostra gli esercizi con stato null (non iniziati) o 'in-corso'
        sql += ` AND (E.statoCompletamento IS NULL OR E.statoCompletamento = 'in-corso')`;
      }

      // Ordina i risultati per data di assegnazione dalla più recente
      sql += ` ORDER BY E.dataAssegnazione DESC`;

      // Prepara ed esegue la query SQL con i parametri raccolti
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      // Restituisce l'array di esercizi come risposta JSON
      return NextResponse.json(rows);
    } catch (error) {
      // Logga l'errore e restituisce errore 500
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del paziente' },
        { status: 500 }
      );
    }
  }

  /* =====================================================
     PARAMETRI MANCANTI
     Se né cf né pIva sono stati forniti, restituisce errore 400
     ===================================================== */
  return NextResponse.json(
    { error: 'Parametri mancanti' },
    { status: 400 }
  );
}
