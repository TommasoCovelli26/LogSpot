import { lusitana } from '../fonts';
import { formatDateToLocal } from '../../lib/utils';
import { headers } from 'next/headers';

export default async function PatientExercises({ cf, pIva }: { cf: string; pIva: string }) {
  // Recuperiamo l'host corrente per costruire l'URL assoluto
  const host = (await headers()).get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/esercizi?cf=${cf}&pIva=${pIva}`, {
    cache: 'no-store' 
  });
  
  if (!res.ok) return <p className="text-2xl text-red-500">Errore nel caricamento esercizi.</p>;

  const exercises = await res.json();

  return (
    <div className="mt-10">
      <h2 className={`${lusitana.className} text-3xl mb-8 text-blue-800 border-b-4 border-blue-200 pb-2`}>
        Storico Esercizi
      </h2>
      <div className="grid gap-6">
        {exercises.map((ex: any) => (
          <div key={ex.id} className="p-8 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                {/* Titolo Attività molto grande */}
                <p className="text-2xl font-black text-gray-900 uppercase tracking-tight">{ex.titolo}</p>
                <p className="text-xl text-gray-600 mt-3">
                  Assegnato il: <span className="font-bold">{formatDateToLocal(ex.dataAssegnazione)}</span>
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-3">
                {/* Badge Stato XL */}
                <span className={`px-6 py-2 rounded-full text-medium font-black ${
                  ex.statoCompletamento === 'completato' 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {ex.statoCompletamento.toUpperCase()}
                </span>
                {ex.esito && (
                  <p className="text-medium font-extrabold text-blue-600 italic">
                    {ex.esito.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}