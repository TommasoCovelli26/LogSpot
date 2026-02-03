"use client";

import { useEffect, useMemo, useState } from 'react';
import MaterialsTabs from '../../ui/logopedista/materials-tabs';
import MaterialsSearch from '../../ui/logopedista/materials-search';
import MaterialsList from '../../ui/logopedista/materials-list';
import FiltersSection from '../../ui/logopedista/filters-section';
import { lusitana } from '../../ui/fonts';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ActivityWithFavorite } from '../../lib/activities';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pIva, setPIva] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityWithFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'recenti';
  const age = searchParams.get('age');
  const pathologies = searchParams.get('pathologies');

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (pIva) params.set('pIva', pIva);
    if (query) params.set('query', query);
    if (filter) params.set('filter', filter);
    if (age) params.set('age', age);
    if (pathologies) params.set('pathologies', pathologies);
    return `/api/materiali-pubblici?${params.toString()}`;
  }, [pIva, query, filter, age, pathologies]);

  useEffect(() => {
    const sessione = localStorage.getItem('utente');

    if (!sessione) {
      router.push('/login');
      return;
    }

    try {
      const utenteObj = JSON.parse(sessione);
      setPIva(utenteObj.codice);
    } catch (e) {
      console.error('Errore parsing sessione:', e);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!pIva) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error('Errore nel caricamento');

        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        console.error(err);
        setError('Errore nel caricamento dei materiali.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [pIva, apiUrl]);

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        <header className="w-full mb-6 text-center md:text-left">
          <h1 className={`${lusitana.className} text-3xl md:text-4xl text-blue-700 font-bold`}>
            Ricerca materiali pubblici
          </h1>
          <p className="text-gray-500 mt-2">
            Esplora tutte le attività con accessibilità pubblica.
          </p>
        </header>

        {/* Tabs Filtro (Recenti / Preferiti) */}
        <MaterialsTabs />

        {/* Barra di Ricerca */}
        <MaterialsSearch />

        {/* Filtri Espandibili */}
        <FiltersSection />

        {/* Lista Materiali */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Caricamento materiali...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <MaterialsList activities={activities} baseHref="/logopedista/ricerca-materiali" />
        )}
      </div>
    </main>
  );
}