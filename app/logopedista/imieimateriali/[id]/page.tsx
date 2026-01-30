import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  PaperClipIcon, 
  UserCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { fetchActivityById } from '../../../lib/activities'; // Nota i 3 livelli indietro
import { lusitana } from '../../../ui/fonts';

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  // 1. Recuperiamo i dati dell'attività
  const activity = await fetchActivityById(params.id);

  // Se l'attività non esiste, mostriamo pagina 404
  if (!activity) {
    notFound();
  }

  // Parsiamo le liste (patologie e allegati) salvate come stringhe CSV
  const patologieList = activity.patologie ? activity.patologie.split(',') : [];
  const allegatiList = activity.immagine ? activity.immagine.split(',') : [];

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER: Tasto Indietro e Titolo */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link 
          href="/logopedista/imieimateriali"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna ai materiali
        </Link>

        <div className="flex justify-between items-start">
            <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-blue-900 mb-2`}>
            {activity.titolo}
            </h1>
            {/* Badge Pubblico/Privato */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                activity.accessibilita 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
                {activity.accessibilita ? 'Pubblica' : 'Privata'}
            </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNA SINISTRA (Contenuto Principale) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* BOX DESCRIZIONE */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Descrizione</h3>
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {activity.descrizione || "Nessuna descrizione fornita."}
                </p>

                {/* Lista Allegati */}
                {allegatiList.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Allegati</h4>
                        <div className="flex flex-wrap gap-3">
                            {allegatiList.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg shadow-sm text-blue-700">
                                    <PaperClipIcon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{file}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* BOX OBBIETTIVO */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Obbiettivo Terapeutico</h3>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                    <p className="text-blue-900 font-medium text-lg italic">
                        "{activity.istruzioni || 'Nessun obiettivo specificato.'}"
                    </p>
                </div>
            </div>

        </div>

        {/* COLONNA DESTRA (Dettagli Tecnici) */}
        <div className="space-y-6">
            
            {/* CARD FASCIA ETÀ */}
            <div className="bg-white p-6 rounded-2xl border-2 border-yellow-400 shadow-[0_4px_0_0_#FACC15]">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fascia d'età</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">{activity.fasciaEta}</span>
                    <span className="text-gray-500 font-medium">anni</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${Math.min((activity.fasciaEta / 100) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* CARD PATOLOGIE */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Patologie Trattate</h3>
                <div className="flex flex-wrap gap-2">
                    {patologieList.length > 0 ? (
                        patologieList.map((pat, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase border border-gray-200">
                                {pat}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm italic">Nessun tag.</span>
                    )}
                </div>
            </div>

            {/* INFO LOGOPEDISTA (Demo) */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <UserCircleIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Creato da</p>
                    <p className="text-sm font-bold text-gray-800">Logopedista Demo</p>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}