'use client';

import { 
  CheckCircleIcon, 
  ClockIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import { AssignedExercise } from '@/lib/activities';
import clsx from 'clsx';
import Link from 'next/link';

// Aggiungiamo patientCf alle props
export default function PazienteEsercizi({ 
  exercises, 
  patientCf 
}: { 
  exercises: AssignedExercise[], 
  patientCf: string 
}) {
  
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
        <p className="text-gray-500 italic">Nessun esercizio assegnato a questo paziente.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {exercises.map((exercise) => (
        <div 
          key={exercise.id} 
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-yellow-400"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              {/* MODIFICATO: Il link ora punta alla pagina specifica dell'esercizio assegnato */}
              <Link 
                href={`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}/esercizio/${exercise.id}`}
                className="font-bold text-gray-800 text-lg hover:text-yellow-400 hover:underline flex items-center gap-2 group"
                title="Vedi dettagli assegnazione"
              >
                {exercise.titolo}
                <EyeIcon className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              Assegnato il: {new Date(exercise.dataAssegnazione).toLocaleDateString('it-IT')}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1",
              {
                'bg-green-100 text-green-700': exercise.statoCompletamento === 'completato',
                'bg-yellow-100 text-yellow-800': exercise.statoCompletamento === 'in-corso' || !exercise.statoCompletamento,
                'bg-gray-100 text-gray-600': exercise.statoCompletamento === 'da-svolgere',
              }
            )}>
              {exercise.statoCompletamento === 'completato' ? (
                <>
                  <CheckCircleIcon className="w-4 h-4" /> Completato
                </>
              ) : (
                <>
                  <ClockIcon className="w-4 h-4" /> In Corso
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}