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
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="px-4 py-2 text-left text-sm font-semibold">Codice Fiscale</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Nome</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Cognome</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Telefono</th>
            <th className="px-4 py-2 text-left text-sm font-semibold">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.cf} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 text-sm">{patient.cf}</td>
              <td className="px-4 py-2 text-sm">{patient.nome}</td>
              <td className="px-4 py-2 text-sm">{patient.cognome}</td>
              <td className="px-4 py-2 text-sm">{patient.email}</td>
              <td className="px-4 py-2 text-sm">{patient.numTelefono || '-'}</td>
              <td className="px-4 py-2 text-sm">
                <form
                  action={async () => {
                    'use server';
                    await assignPatientToLogopedist(patient.cf, pIva);
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-md bg-green-600 px-3 py-1 text-white text-xs font-medium hover:bg-green-700"
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
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Accoppiamento Paziente</h1>
        <Link href="/logopedista/lista-pazienti" className="rounded-md bg-gray-600 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700">
          Indietro
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Cerca per codice fiscale..." />
      </div>
      <Suspense key={query} fallback={<div className="mt-6 text-center py-10">Caricamento...</div>}>
        <UnassignedPatientsList query={query} pIva={pIva} />
      </Suspense>
    </div>
  );
}