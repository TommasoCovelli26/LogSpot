import { Suspense } from 'react';
import CreateMaterialButton from '../../ui/logopedista/create-material';
import MaterialsTabs from '../../ui/logopedista/materials-tabs';
import MaterialsSearch from '../../ui/logopedista/materials-search';
import MaterialsList from '../../ui/logopedista/materials-list';
import { fetchActivities } from '../../lib/activities';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    filter?: string;
  };
}) {
  // Simuliamo ID utente (in produzione usa sessione)
  const userId = '12345678901';
  
  const query = searchParams?.query || '';
  const filter = searchParams?.filter || 'recenti';

  // Recuperiamo i dati lato server
  const activities = await fetchActivities(userId, query, filter);

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        
        {/* 1. Bottone Creazione */}
        <CreateMaterialButton />

        {/* 2. Tabs Filtro (Recenti / Preferiti) */}
        <MaterialsTabs />

        {/* 3. Barra di Ricerca */}
        <MaterialsSearch />

        {/* 4. Lista Materiali (con Suspense per caricamento fluido) */}
        <Suspense key={query + filter} fallback={<div className="text-center py-10 text-gray-500">Caricamento materiali...</div>}>
          <MaterialsList activities={activities} />
        </Suspense>

      </div>
    </main>
  );
}