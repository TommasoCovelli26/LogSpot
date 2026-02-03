import { Suspense } from 'react';
import { cookies } from 'next/headers'; // Importiamo i cookies
import { redirect } from 'next/navigation'; // Per il redirect server-side
import CreateMaterialButton from '../../ui/logopedista/create-material';
import MaterialsTabs from '../../ui/logopedista/materials-tabs';
import MaterialsSearch from '../../ui/logopedista/materials-search';
import MaterialsList from '../../ui/logopedista/materials-list';
import { fetchActivities } from '../../lib/activities';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    filter?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const filter = params?.filter || 'recenti';

  // 1. RECUPERO UTENTE DAI COOKIE
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');

  // Se il cookie non c'è, rimanda al login
  if (!userCookie) {
    redirect('/login');
  }

  let userId = '';

  try {
    const userData = JSON.parse(userCookie.value);
    
    // Verifichiamo che sia un logopedista e abbia la P.IVA
    if (userData.ruolo !== 'logopedista' || !userData.utente?.pIva) {
      // Se non è autorizzato, via
      redirect('/dashboard'); 
    }

    // Ecco la P.IVA reale dell'utente loggato!
    userId = userData.utente.pIva;

  } catch (error) {
    // Se il cookie è rovinato
    redirect('/login');
  }

  // 2. RECUPERO DATI DAL DB USANDO L'ID REALE
  const activities = await fetchActivities(userId, query, filter);

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        <CreateMaterialButton />
        <MaterialsTabs />
        <MaterialsSearch />
        
        <Suspense key={query + filter} fallback={<div className="text-center py-10 text-gray-500">Caricamento materiali...</div>}>
          <MaterialsList activities={activities} />
        </Suspense>

      </div>
    </main>
  );
}