import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pIva = searchParams.get('pIva');

    if (!pIva) {
      return NextResponse.json(
        { error: 'pIva non fornita' },
        { status: 400 }
      );
    }

    // Query per recuperare tutti i feedback degli esercizi assegnati dal logopedista
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

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Errore nel recupero dei feedback:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei feedback' },
      { status: 500 }
    );
  }
}
