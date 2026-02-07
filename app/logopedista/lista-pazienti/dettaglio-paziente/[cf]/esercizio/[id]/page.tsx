import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { lusitana } from '@/ui/fonts';
import DetailImageViewer from '@/ui/logopedista/detail-image-viewer';
import UnassignButton from '@/ui/logopedista/unassignActivity-button';

export default async function AssignedExercisePage({ 
  params 
}: { 
  params: Promise<{ cf: string; id: string }> 
}) {
  const { cf, id } = await params;
  const exerciseId = parseInt(id);

  // 1. Recuperiamo i dettagli dell'esercizio uniti all'attività
  const data = db.prepare(`
    SELECT 
      E.id as exercise_id,
      E.dataAssegnazione,
      E.statoCompletamento,
      A.titolo,
      A.descrizione,
      A.istruzioni,
      A.immagine,
      A.fasciaEta,
      A.patologie
    FROM Esercizio E
    JOIN Attivita A ON E.id_attivita = A.cod
    WHERE E.id = ? AND E.id_paziente = ?
  `).get(exerciseId, cf) as any;

  if (!data) {
    notFound();
  }

  const patologieList = data.patologie ? data.patologie.split(',') : [];
  const allegatiList = data.immagine ? data.immagine.split('|') : [];

  // Recuperiamo i feedback per questo esercizio
  const feedbacks = db.prepare(`
    SELECT 
      cod,
      messaggio,
      data
    FROM Feedback
    WHERE id_esercizio = ? AND id_paziente = ?
    ORDER BY data DESC
  `).all(exerciseId, cf) as any[];

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER con navigazione breadcrumb */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link 
          href={`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna al Paziente
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-400`}>
              {data.titolo}
            </h1>
            
            <div className="flex gap-3">
               <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-yellow-100 text-black border-yellow-500 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Visualizzazione Assegnazione
               </span>
               <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(data.dataAssegnazione).toLocaleDateString()}
               </span>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA (Contenuto) */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" /> Descrizione Attività
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {data.descrizione || "Nessuna descrizione."}
                </p>
                <DetailImageViewer images={allegatiList} />
            </div>

            <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-100">
                <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4">
                    Obiettivo Terapeutico
                </h3>
                <p className="text-yellow-900 font-medium text-xl italic leading-relaxed">
                    "{data.istruzioni || 'Nessun obiettivo.'}"
                </p>
            </div>
        </div>

        {/* COLONNA DESTRA (Info e Azioni) */}
        <div className="space-y-6">
            
            {/* Box Stato */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Stato Attuale</h3>
                <p className={`text-xl font-bold uppercase ${data.statoCompletamento === 'completato' ? 'text-green-600' : 'text-yellow-400'}`}>
                   {data.statoCompletamento || 'Da Svolgere'}
                </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Patologie</h3>
                <div className="flex flex-wrap gap-2">
                    {patologieList.map((pat: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-bold uppercase border border-gray-200">
                            {pat}
                        </span>
                    ))}
                </div>
            </div>

            {/* TASTO AZIONE - SOLO RIMUOVI */}
            <div className="pt-6 border-t border-gray-100">
               <UnassignButton exerciseId={exerciseId} patientCf={cf} />
            </div>

        </div>
      </div>

      {/* SEZIONE FEEDBACK */}
      <div className="max-w-5xl mx-auto mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Feedback del Paziente</h2>
        
        {feedbacks && feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback: any) => (
              <div key={feedback.cod} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    Feedback 
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(feedback.data).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                  {feedback.messaggio || 'Nessun messaggio'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-500 text-lg">Nessun feedback disponibile per questo esercizio.</p>
          </div>
        )}
      </div>
    </main>
  );
}