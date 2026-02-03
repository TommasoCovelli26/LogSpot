import Link from 'next/link';
import { lusitana } from '../fonts';
import { AssignedExercise } from '../../lib/activities';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const getStatusBadge = (status: string | null) => {
  if (!status || status === 'in-corso') {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">In Corso</span>;
  }
  if (status === 'completato') {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completato</span>;
  }
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Non iniziato</span>;
};

export default function ExercisesList({ exercises }: { exercises: AssignedExercise[] }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Tabella */}
      <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">ESERCIZIO</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-center">STATO</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 text-right">DATA ASSEGNAZIONE</span>
      </div>

      {/* Righe */}
      <div className="divide-y divide-gray-100">
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <Link 
              key={exercise.id}
              href={`/paziente/esercizi/${exercise.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-blue-50 transition-colors group"
            >
              <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black flex-1`}>
                {exercise.titolo}
              </span>

              <div className="w-32 flex justify-center">
                {getStatusBadge(exercise.statoCompletamento)}
              </div>

              <span className="text-gray-400 text-sm font-medium w-32 text-right">
                {formatDate(exercise.dataAssegnazione)}
              </span>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400 italic">
            Nessun esercizio assegnato.
          </div>
        )}
      </div>
    </div>
  );
}
