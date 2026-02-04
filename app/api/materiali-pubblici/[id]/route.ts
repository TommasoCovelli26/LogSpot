import { NextResponse } from 'next/server';
import { fetchActivityById } from '@/lib/activities';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const activity = await fetchActivityById(id);

    if (!activity || !activity.accessibilita) {
      return NextResponse.json({ error: 'Attività non trovata' }, { status: 404 });
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Errore recupero attività pubblica:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell’attività pubblica' },
      { status: 500 }
    );
  }
}
