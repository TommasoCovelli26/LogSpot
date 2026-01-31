import { Suspense } from 'react';
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
  // 1. ATTENDIAMO I PARAMETRI (Fondamentale per Next.js 15)
  const params = await searchParams;
  
  const query = params?.query || '';
  const filter = params?.filter || 'recenti';

  // ID utente fisso per la demo
  const userId = '12345678901';

  // Recuperiamo i dati filtrati dal database
  const activities = await fetchActivities(userId, query, filter);

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        
        {/* Bottone Creazione */}
        <CreateMaterialButton />

        {/* Tabs Filtro (Recenti / Preferiti) */}
        <MaterialsTabs />

        {/* Barra di Ricerca */}
        <MaterialsSearch />

        {/* Lista Materiali */}
        <Suspense key={query + filter} fallback={<div className="text-center py-10 text-gray-500">Caricamento materiali...</div>}>
          <MaterialsList activities={activities} />
        </Suspense>

      </div>
    </main>
  );
}