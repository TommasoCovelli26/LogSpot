import { fetchPatientsByCf } from '@/lib/patients';
import { lusitana } from '@/ui/fonts';
import { formatDateToLocal } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import UnassignButton from '@/ui/logopedista/unassign-button';
import { fetchAssignedExercises } from '@/lib/activities';
import PazienteEsercizi from '@/ui/logopedista/paziente-esercizi';
import { 
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default async function Page({ params }: { params: Promise<{ cf: string }> }) {
  const { cf } = await params;
  const patient = await fetchPatientsByCf(cf);

  if (!patient) {
    notFound();
  }

  const exercises = await fetchAssignedExercises(cf);

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link 
          href="/logopedista/lista-pazienti"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna alla lista pazienti
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <UserCircleIcon className="w-12 h-12 text-blue-500" />
            <div>
              <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-blue-500`}>
                {patient.cognome} {patient.nome}
              </h1>
              <p className="text-sm text-gray-500 font-mono mt-1">{patient.cf}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <UnassignButton cf={cf} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA - Esercizi Assegnati */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-400"></div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" /> Esercizi Assegnati
            </h3>
            <PazienteEsercizi exercises={exercises} patientCf={cf} />
          </div>
        </div>

        {/* COLONNA DESTRA - Info Paziente */}
        <div className="space-y-6">
          
          {/* Data di Nascita */}
          <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Data di Nascita
            </h3>
            <p className="text-lg font-semibold text-blue-900">
              {patient.dataNascita ? formatDateToLocal(patient.dataNascita) : 'Non disponibile'}
            </p>
          </div>

          {/* Email */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4" />
              Email
            </h3>
            <p className="text-sm text-gray-800 break-words">
              {patient.email}
            </p>
          </div>

          {/* Telefono */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              Telefono
            </h3>
            <p className="text-sm text-gray-800">
              {patient.numTelefono || 'Non disponibile'}
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
