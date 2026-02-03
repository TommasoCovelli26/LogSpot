"use client"; // Deve essere la prima riga assoluta

import Search from '@/ui/logopedista/search';
import PatientsTable from '@/ui/logopedista/pazienti-table';
import { lusitana } from '@/ui/fonts';
import { fetchPatients } from '@/lib/patients';
import { Suspense, useEffect, useState, use } from 'react'; // Hook per la sessione
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Lista Pazienti</h1>
        <Link 
          href="/logopedista/lista-pazienti/accoppiamento-paziente" 
          className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700"
        >
          +
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Cerca per nome o cognome..." />
      </div>
      
      {isLoading ? (
        <div className="mt-6 text-center py-10">Caricamento in corso...</div>
      ) : (
        <PatientsTable patients={patients} />
      )}
    </div>
  );
}