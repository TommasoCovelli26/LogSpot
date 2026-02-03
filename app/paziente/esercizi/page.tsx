'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExercisesTabs from '../../ui/paziente/exercises-tabs';
import ExercisesSearch from '../../ui/paziente/exercises-search';
import ExercisesListWrapper from '../../ui/paziente/exercises-list-wrapper';

export default function Page() {
  const router = useRouter();
  const [patientCf, setPatientCf] = useState<string | null>(null);

  useEffect(() => {
    // Recupera il CF del paziente dal localStorage
    const utenteStr = localStorage.getItem('utente');
    if (!utenteStr) {
      router.push('/login');
      return;
    }

    const utente = JSON.parse(utenteStr);
    
    // Verifica che sia un paziente
    if (utente.ruolo !== 'paziente') {
      router.push('/dashboard');
      return;
    }

    // Imposta il CF (salvato come 'codice' nel localStorage)
    setPatientCf(utente.codice);
  }, [router]);

  if (!patientCf) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Caricamento...</div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-4xl">
        
        {/* Titolo */}
        <div className="w-full mb-6">
          <h1 className="text-3xl font-bold text-gray-900">I Miei Esercizi</h1>
          <p className="text-gray-500 mt-2">Visualizza e svolgi gli esercizi assegnati dal tuo logopedista</p>
        </div>

        {/* Tabs Filtro (Tutti / In Corso / Completati) */}
        <ExercisesTabs />

        {/* Barra di Ricerca */}
        <ExercisesSearch />

        {/* Lista Esercizi */}
        <ExercisesListWrapper patientCf={patientCf} />

      </div>
    </main>
  );
}
