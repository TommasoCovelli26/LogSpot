import Search from '@/ui/logopedista/search';
import { lusitana } from '@/ui/fonts';
import { fetchUnassignedPatients } from '@/lib/patients';
import { assignPatientToLogopedist } from '@/lib/actions';
import { Suspense } from 'react';
import Link from 'next/link';

interface Patient {
  cf: string;
  nome: string;
  cognome: string;
  email: string;
  numTelefono: string | null;
  dataNascita: string | null;
}

async function UnassignedPatientsList({ query, pIva }: { query: string; pIva: string }) {
  if (!query || !query.trim()) {
    return (
      <div className="mt-6 text-center py-10 text-gray-500">
        Inserisci un codice fiscale per cercare pazienti
      </div>
    );
  }

  const patients = await fetchUnassignedPatients(query);

  if (patients.length === 0) {
    return (
      <div className="mt-6 text-center py-10 text-gray-500">
        Nessun paziente trovato senza logopedista assegnato
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Codice Fiscale</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Cognome</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Telefono</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.cf} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-700">{patient.cf}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{patient.nome}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{patient.cognome}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{patient.email}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{patient.numTelefono || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <form
                  action={async () => {
                    'use server';
                    await assignPatientToLogopedist(patient.cf, pIva);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full bg-green-500 px-4 py-2 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-600 transition shadow-md"
                  >
                    Abbina
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const pIva = '12345678901'; // TODO: get from session/auth

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
              Accoppiamento Paziente
            </h1>
            <p className="text-gray-500 mt-2">
              Cerca un paziente non assegnato e abbinalo al logopedista.
            </p>
          </div>
          <Link
            href="/logopedista/lista-pazienti"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-full font-bold uppercase text-xs hover:bg-gray-700 transition shadow-md tracking-wider"
          >
            Indietro
          </Link>
        </div>
        <div className="w-full mb-6">
          <Search placeholder="Cerca per codice fiscale..." />
        </div>
        <Suspense key={query} fallback={<div className="mt-6 text-center py-10 text-gray-500">Caricamento...</div>}>
          <UnassignedPatientsList query={query} pIva={pIva} />
        </Suspense>
      </div>
    </main>
  );
}