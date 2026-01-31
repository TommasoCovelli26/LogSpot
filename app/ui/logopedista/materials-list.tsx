import Link from 'next/link';
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
            // 1. NON usiamo Link qui. Usiamo un div contenitore per la riga.
            <div 
              key={act.cod} 
              className="flex items-center hover:bg-yellow-50 transition-colors group relative"
            >
              
              {/* 2. IL CUORE: Sta fuori dal Link, a sinistra */}
              <div className="pl-6 pr-2 z-10">
                 <FavoriteHeart cod={act.cod} initialStatus={act.isFavorite} />
              </div>

              {/* 3. IL LINK: Avvolge solo il titolo e la data, riempie il resto della riga */}
              <Link 
                href={`/logopedista/imieimateriali/${act.cod}`}
                className="flex-1 flex justify-between items-center py-4 pr-6 pl-2"
              >
                  <span className={`font-bold text-gray-800 ${lusitana.className} text-lg group-hover:text-black`}>
                    {act.titolo}
                  </span>

                  <span className="text-gray-400 text-sm font-medium uppercase">
                    {formatDate(act.dataCreazione)}
                  </span>
              </Link>

            </div>
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