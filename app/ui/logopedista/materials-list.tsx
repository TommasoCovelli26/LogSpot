import Link from 'next/link'; // <--- 1. Importa Link
import { lusitana } from '../../ui/fonts';
import FavoriteHeart from './favorite-heart';
import { ActivityWithFavorite } from '../../lib/activities';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function MaterialsList({ activities }: { activities: ActivityWithFavorite[] }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Tabella */}
      <div className="flex justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">NOME</span>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">ULTIMA MODIFICA</span>
      </div>

      {/* Righe */}
      <div className="divide-y divide-gray-100">
        {activities.length > 0 ? (
          activities.map((act) => (
            // 2. Avvolgiamo tutto il contenuto della riga nel Link
            // Usiamo 'block' per rendere cliccabile tutta l'area
            <Link 
              key={act.cod} 
              href={`/logopedista/imieimateriali/${act.cod}`}
              className="block hover:bg-yellow-50 transition-colors group"
            >
              <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-3">
                  {/* Il cuore deve rimanere cliccabile separatamente, 
                      ecco perché in favorite-heart.tsx abbiamo messo e.stopPropagation() */}
                  <FavoriteHeart cod={act.cod} initialStatus={act.isFavorite} />

                  <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black`}>
                    {act.titolo}
                  </span>
                </div>

                <span className="text-gray-400 text-sm font-medium uppercase">
                  {formatDate(act.dataCreazione)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center text-gray-400 italic">
            Nessuna attività trovata.
          </div>
        )}
      </div>
    </div>
  );
}