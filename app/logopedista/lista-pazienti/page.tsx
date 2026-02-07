"use client"; // Deve essere la prima riga assoluta

import Search from '@/ui/logopedista/search';
import PatientsTable from '@/ui/logopedista/pazienti-table';
import { lusitana } from '@/ui/fonts';
import { fetchPatients } from '@/lib/patients';
import { Suspense, useEffect, useState, use } from 'react'; // Hook per la sessione
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChatBubbleLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

// RIMOSSO 'async' qui sotto per compatibilità Client Component
export default function Page(props: {
  searchParams: Promise<{ query?: string }>;
}) {
  const searchParams = use(props.searchParams); // Unwrapping della Promise per Next.js 15+
  const router = useRouter();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const query = searchParams?.query || '';

  useEffect(() => {
    // Gestione della sessione tramite localStorage
    const sessione = localStorage.getItem("utente");

    if (!sessione) {
      router.push("/login"); // Redirect se la sessione non esiste
      return;
    }

    const utenteObj = JSON.parse(sessione);
    const pIva = utenteObj.codice; // Recupero pIva dal localStorage



    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch dei dati basato sulla pIva della sessione
        const data = await fetchPatients(pIva, query);
        setPatients(data);
      } catch (error) {
        console.error("Errore nel caricamento dei pazienti:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [query, router]);

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        
        {/* Header con bottoni */}
        <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
              Lista Pazienti
            </h1>
            <p className="text-gray-500 mt-2">
              Gestisci i tuoi pazienti e visualizza i loro progressi.
            </p>
          </div>
          
          <div className="flex gap-3">
            <Link 
              href="/logopedista/lista-pazienti/feedback" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full font-bold uppercase text-xs hover:bg-blue-600 transition shadow-md tracking-wider"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              Feedback
            </Link>
            <Link 
              href="/logopedista/lista-pazienti/accoppiamento-paziente" 
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-bold uppercase text-xs hover:bg-green-600 transition shadow-md tracking-wider"
            >
              <PlusIcon className="w-4 h-4" />
              Nuovo Paziente
            </Link>
          </div>
        </div>

        {/* Barra di Ricerca */}
        <div className="w-full mb-6">
          <Search placeholder="Cerca per nome o cognome..." />
        </div>
        
        {/* Lista Pazienti */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Caricamento in corso...</div>
        ) : (
          <div className="w-full">
            <PatientsTable patients={patients} />
          </div>
        )}
      </div>
    </main>
  );
}