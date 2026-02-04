import { NextResponse } from 'next/server';
import { fetchPublicActivities } from '@/lib/activities';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const pIva = searchParams.get('pIva');
  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'recenti';
  const ageParam = searchParams.get('age');
  const pathologiesParam = searchParams.get('pathologies');

  if (!pIva) {
    return NextResponse.json({ error: 'Logopedista non autenticato' }, { status: 401 });
  }

  const age = ageParam ? Number(ageParam) : undefined;
  const pathologies = pathologiesParam
    ? pathologiesParam.split(',').map((p) => p.trim()).filter(Boolean)
    : undefined;

  try {
    const activities = await fetchPublicActivities(pIva, query, filter, age, pathologies);
    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Errore recupero materiali pubblici:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei materiali pubblici' },
      { status: 500 }
    );
  }
}
