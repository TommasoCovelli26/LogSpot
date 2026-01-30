import { fetchPatientsByCf } from '@/lib/patients';
import { lusitana } from '@/ui/fonts';
import { formatDateToLocal } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UnassignButton from '@/ui/logopedista/unassign-button';

export default async function Page({ params }: { params: Promise<{ cf: string }> }) {
  const { cf } = await params;
  const patient = await fetchPatientsByCf(cf);

  if (!patient) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className={`${lusitana.className} text-2xl`}>Dettaglio Paziente</h1>
        <div className="flex gap-3">
          <UnassignButton cf={cf} />
          <Link
            href="/logopedista/lista-pazienti"
            className="rounded-md bg-gray-600 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700"
          >
            Indietro
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-4xl font-semibold text-gray-900">
          {patient.cognome} {patient.nome}
        </p>
        <p className="text-lg text-gray-600 font-mono mt-1">{patient.cf}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl">🎂</span>
          <p className="text-medium text-gray-600">
            {patient.dataNascita ? formatDateToLocal(patient.dataNascita) : 'Data non disponibile'}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-semibold text-gray-900">Informazioni di Contatto</p>
          <div className="mt-2 space-y-1">
            <p className="text-xl text-gray-600">
              <span className="font-medium">Email:</span> {patient.email}
            </p>
            <p className="text-xl text-gray-600">
              <span className="font-medium">Telefono:</span> {patient.numTelefono || '—'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
