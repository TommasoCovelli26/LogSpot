import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cf = searchParams.get('cf');
  const pIva = searchParams.get('pIva');
  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'tutti';

  /* =====================================================
     CASO LOGOPEDISTA (cf + pIva)
     ===================================================== */
  if (cf && pIva) {
    try {
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

      const rows = stmt.all(cf, pIva);
      return NextResponse.json(rows);
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del logopedista' },
        { status: 500 }
      );
    }
  }

  /* =====================================================
     CASO PAZIENTE (solo cf)
     ===================================================== */
  if (cf) {
    try {
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

      const params: any[] = [cf];

      // 🔍 Filtro ricerca
      if (query) {
        sql += ` AND A.titolo LIKE ?`;
        params.push(`%${query}%`);
      }

      // 🏷️ Filtro stato
      if (filter === 'completati') {
        sql += ` AND E.statoCompletamento = 'completato'`;
      } else if (filter === 'in-corso') {
        sql += ` AND (E.statoCompletamento IS NULL OR E.statoCompletamento = 'in-corso')`;
      }

      sql += ` ORDER BY E.dataAssegnazione DESC`;

      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      return NextResponse.json(rows);
    } catch (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Errore nel recupero degli esercizi del paziente' },
        { status: 500 }
      );
    }
  }

  /* =====================================================
     PARAMETRI MANCANTI
     ===================================================== */
  return NextResponse.json(
    { error: 'Parametri mancanti' },
    { status: 400 }
  );
}
