import Search from '@/ui/logopedista/search';
import PatientsTable from '@/ui/logopedista/pazienti-table';
import { lusitana } from '@/ui/fonts';
import { fetchPatients } from '@/lib/patients';
import { Suspense } from 'react';
import Link from 'next/link';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const pIva = '12345678901'; // TODO: get from session/auth
  const query = searchParams?.query || '';
  const patients = await fetchPatients(pIva, query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Lista Pazienti</h1>
        <Link href="/logopedista/lista-pazienti/accoppiamento-paziente" className="rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">
          +
        </Link>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Cerca per nome o cognome..." />
      </div>
      <Suspense key={query} fallback={<div className="mt-6 text-center py-10">Caricamento...</div>}>
        <PatientsTable patients={patients} />
      </Suspense>
    </div>
  );
}