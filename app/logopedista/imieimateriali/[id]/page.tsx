import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PaperClipIcon, 
  UserCircleIcon,
  DocumentTextIcon,
  PencilSquareIcon // <--- Nuova icona
} from '@heroicons/react/24/outline';
import { fetchActivityById } from '../../../lib/activities';
import { lusitana } from '../../../ui/fonts';
import DeleteActivityButton from '../../../ui/logopedista/delete-button';

export default async function ActivityDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const activity = await fetchActivityById(id);

  if (!activity) {
    notFound();
  }

  const patologieList = activity.patologie ? activity.patologie.split(',') : [];
  const allegatiList = activity.immagine ? activity.immagine.split(',') : [];

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link 
          href="/logopedista/imieimateriali"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna ai materiali
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
            {/* 1. TITOLO IN GIALLO */}
            <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-yellow-400`}>
              {activity.titolo}
            </h1>
            
            <div className="flex items-center gap-3">
                {/* 2. TASTO MODIFICA */}
                <Link 
                    href={`/logopedista/imieimateriali/${id}/modifica`}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-white rounded-full font-bold uppercase text-xs hover:bg-yellow-500 transition shadow-md tracking-wider"
                >
                    <PencilSquareIcon className="w-4 h-4" />
                    Modifica
                </Link>

                {/* Badge Pubblico/Privato */}
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    activity.accessibilita 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                    {activity.accessibilita ? 'Pubblica' : 'Privata'}
                </span>
            </div>
        </div>
      </div>

      {/* ... IL RESTO DELLA PAGINA RIMANE INVARIATO (Griglia contenuti, ecc.) ... */}
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNA SINISTRA */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5" /> Descrizione
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {activity.descrizione || "Nessuna descrizione inserita per questa attività."}
                </p>
                {allegatiList.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <PaperClipIcon className="w-4 h-4" /> Allegati ({allegatiList.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {allegatiList.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 transition hover:bg-yellow-100 cursor-default">
                                    <div className="bg-yellow-200 p-1.5 rounded-lg">
                                        <PaperClipIcon className="w-4 h-4 text-yellow-800" />
                                    </div>
                                    <span className="font-bold text-sm truncate max-w-[200px]">{file}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">
                    Obiettivo Terapeutico
                </h3>
                <p className="text-blue-900 font-medium text-xl italic leading-relaxed">
                    "{activity.istruzioni || 'Nessun obiettivo specificato.'}"
                </p>
            </div>
        </div>

        {/* COLONNA DESTRA */}
        <div className="space-y-6">
            <div className="bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-400 shadow-sm">
                <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-2">Target Età</h3>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-black text-yellow-900 tracking-tight">{activity.fasciaEta}</span>
                    <span className="text-yellow-700 font-bold uppercase text-sm">anni</span>
                </div>
                <div className="w-full bg-white h-3 rounded-full overflow-hidden relative border border-yellow-200">
                    <div 
                        className="h-full bg-yellow-400 rounded-full relative" 
                        style={{ width: `${Math.min((activity.fasciaEta / 123) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 shadow-sm">
                <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-4">Patologie</h3>
                <div className="flex flex-wrap gap-2">
                    {patologieList.length > 0 ? (
                        patologieList.map((pat, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white text-yellow-800 rounded-lg text-xs font-bold uppercase border border-yellow-200 tracking-wide shadow-sm">
                                {pat}
                            </span>
                        ))
                    ) : (
                        <span className="text-yellow-600 text-sm italic">Nessun tag specificato.</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 mt-8">
                <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                    <UserCircleIcon className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Creato da</p>
                    <p className="text-sm font-bold text-gray-800">Logopedista Demo</p>
                </div>
            </div>

            <DeleteActivityButton id={activity.cod} />
        </div>
      </div>
    </main>
  );
}