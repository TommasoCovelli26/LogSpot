"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { lusitana } from '@/ui/fonts';
import { formatDateToLocal } from '@/lib/utils';

export default function ProgressiPazientePage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gestione sessione: recupero CF del paziente loggato
    const sessione = localStorage.getItem("utente");
    if (!sessione) {
      router.push("/login");
      return;
    }

    const utenteObj = JSON.parse(sessione);
    const cf = utenteObj.codice;
    

    const fetchProgressi = async () => {
      try {
        const res = await fetch(`/api/progressi?cf=${cf}`);
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
        }
      } catch (err) {
        console.error("Errore nel caricamento dei progressi", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressi();
  }, [router]);

  // Calcolo Statistiche
  const total = exercises.length;
  const completed = exercises.filter(ex => ex.statoCompletamento === 'completato');
  const avgDuration = completed.length > 0 
    ? (completed.reduce((acc, curr) => acc + (curr.durata || 0), 0) / completed.length).toFixed(1) 
    : 0;

  if (isLoading) return <div className="p-10 text-3xl">Analisi progressi in corso...</div>;

  return (
    <main className="w-full max-w-5xl mx-auto p-6">
      <h1 className={`${lusitana.className} text-5xl text-blue-900 mb-10`}>I Miei Traguardi</h1>

      {/* Sezione Statistiche a scritte grandi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
        <div className="bg-blue-50 p-10 rounded-3xl border-2 border-blue-200 shadow-sm text-center">
          <p className="text-2xl text-blue-700 font-bold uppercase tracking-wider">Esercizi Fatti</p>
          <p className="text-6xl font-black text-blue-900 mt-4 text-">
            {completed.length} <span className="text-3xl text-blue-400">/ {total}</span>
          </p>
        </div>

        <div className="bg-orange-50 p-10 rounded-3xl border-2 border-orange-200 shadow-sm text-center">
          <p className="text-2xl text-orange-700 font-bold uppercase tracking-wider">Tempo Medio</p>
          <p className="text-6xl font-black text-orange-900 mt-4">
            {avgDuration} <span className="text-3xl text-orange-400">min</span>
          </p>
        </div>
      </div>

      {/* Lista Attività Completate */}
      <h2 className={`${lusitana.className} text-4xl mb-8 text-gray-800 border-b-4 border-gray-100 pb-2`}>
        Storico Attività Completate
      </h2>
      
      <div className="space-y-6">
        {completed.length > 0 ? (
          completed.map((ex) => (
            <div key={ex.id} className="p-8 bg-white rounded-2xl border-2 border-gray-100 shadow-md flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">{ex.titolo}</p>
                <p className="text-xl text-gray-500 mt-2">
                  Assegnata il: <span className="font-semibold">{formatDateToLocal(ex.dataAssegnazione)}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-400 mt-2">Durata sessione: {ex.durata} min</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-2xl text-gray-400 italic">Non hai ancora completato nessun esercizio. Forza!</p>
        )}
      </div>
    </main>
  );
}