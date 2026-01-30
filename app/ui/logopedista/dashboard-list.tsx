'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'; // Cuore vuoto
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';     // Cuore pieno
import clsx from 'clsx';
import { lusitana } from '../fonts';
import { toggleFavorite } from '../../lib/actions'; // Importiamo la server action
import { ActivityWithFavorite } from '../../logopedista/imieimateriali/page';

export default function DashboardList({ activities }: { activities: ActivityWithFavorite[] }) {
  const [activeTab, setActiveTab] = useState('recenti'); // Solo: recenti | preferiti
  const [searchQuery, setSearchQuery] = useState('');
  
  // Usiamo uno stato locale per gestire l'UI reattiva (feedback immediato al click)
  const [localActivities, setLocalActivities] = useState(activities);

  // Se i dati dal server cambiano (es. dopo revalidatePath), aggiorniamo lo stato locale
  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  // Gestione del click sul cuore
  const handleToggleHeart = async (cod: number, currentStatus: boolean) => {
    // 1. Aggiornamento Ottimistico (Immediato sull'interfaccia)
    const newStatus = !currentStatus;
    setLocalActivities((prev) => 
      prev.map((act) => 
        act.cod === cod ? { ...act, isFavorite: newStatus } : act
      )
    );

    // 2. Aggiornamento Database (Server Action)
    try {
      await toggleFavorite(cod, newStatus);
    } catch (e) {
      // Se fallisce, annulliamo la modifica (opzionale, per semplicità qui non gestito)
      console.error("Errore salvataggio preferito");
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`;
    if (seconds < 172800) return "IERI";
    return date.toLocaleDateString('it-IT');
  };

  // LOGICA DI FILTRO AGGIORNATA
  const filteredActivities = localActivities.filter((act) => {
    // 1. Filtro Ricerca
    const matchesSearch = act.titolo.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filtro Tab Preferiti
    const matchesTab = activeTab === 'preferiti' ? act.isFavorite : true;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
      
      {/* SEZIONE SUPERIORE */}
      <div className="w-full flex flex-col items-center mb-8 mt-4">
        <div className="relative mb-4">
            <div className="w-72 h-42 border-4 border-yellow-400 rounded-xl flex items-center justify-center bg-gray-50 shadow-sm">
                <PlusIcon className="w-10 h-10 text-yellow-500" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400 rounded-full"></div>
        </div>
        <Link href="/logopedista/crea">
          <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-colors text-black font-bold py-3 px-8 rounded-xl shadow-md text-lg">
            <PlusIcon className="w-6 h-6" />
            NUOVA ATTIVITÀ
          </button>
        </Link>
      </div>

      {/* SEZIONE TAB - Rimosso "Condivisi con me" */}
      <div className="flex gap-2 mb-6 w-full overflow-x-auto pb-2 justify-center md:justify-start">
        <button
          onClick={() => setActiveTab('recenti')}
          className={clsx(
            "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
            activeTab === 'recenti' ? "bg-yellow-400 text-black shadow-md" : "bg-white text-gray-400 border border-gray-200"
          )}
        >
          RECENTI
        </button>
        <button
          onClick={() => setActiveTab('preferiti')}
          className={clsx(
            "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
            activeTab === 'preferiti' ? "bg-yellow-400 text-black shadow-md" : "bg-white text-gray-400 border border-gray-200"
          )}
        >
          PREFERITI
        </button>
      </div>

      {/* BARRA DI RICERCA */}
      <div className="w-full relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="CERCA..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-gray-600 focus:outline-none focus:border-yellow-400 shadow-sm"
        />
      </div>

      {/* LISTA ATTIVITÀ */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NOME</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ULTIMA MODIFICA</span>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((act) => (
              <div key={act.cod} className="flex justify-between items-center px-6 py-4 hover:bg-yellow-50 transition-colors group">
                {/* Nome + Cuore */}
                <div className="flex items-center gap-3">
                  {/* Icona Cuore Interattiva */}
                  <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Evita di cliccare la riga intera se aggiungi link
                        handleToggleHeart(act.cod, act.isFavorite);
                    }}
                    className="focus:outline-none transition-transform active:scale-110"
                  >
                    {act.isFavorite ? (
                      <HeartSolid className="w-6 h-6 text-red-500" />
                    ) : (
                      <HeartOutline className="w-6 h-6 text-gray-300 hover:text-red-400" />
                    )}
                  </button>

                  <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black`}>
                    {act.titolo}
                  </span>
                </div>

                <span className="text-gray-400 text-sm font-medium uppercase">
                  {timeAgo(act.dataCreazione)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-400 italic">
              {activeTab === 'preferiti' 
                ? "Non hai ancora aggiunto attività ai preferiti." 
                : "Nessuna attività trovata."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}