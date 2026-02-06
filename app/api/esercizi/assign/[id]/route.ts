import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activityId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const pIva = searchParams.get('pIva');

    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: 'ID attività non valido' },
        { status: 400 }
      );
    }

    if (!pIva) {
      return NextResponse.json(
        { error: 'pIva non fornita' },
        { status: 400 }
      );
    }

    // Recupera i CF dei pazienti che hanno già questa attività assegnata dal logopedista corrente
    const assignedPatients = db.prepare(`
      SELECT DISTINCT E.id_paziente
      FROM Esercizio E
      WHERE E.id_attivita = ? AND E.id_logopedista = ?
    `).all(activityId, pIva) as any[];

    const assignedCFs = assignedPatients.map(p => p.id_paziente);

    return NextResponse.json({ assignedCFs });
  } catch (error) {
    console.error('Errore nel recupero delle assegnazioni:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle assegnazioni' },
      { status: 500 }
    );
  }
}
