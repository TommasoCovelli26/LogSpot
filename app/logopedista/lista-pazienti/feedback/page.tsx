'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { lusitana } from '@/ui/fonts';
import { ArrowLeftIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface Feedback {
  cod: number;
  messaggio: string;
  data: string;
  id_paziente: string;
  id_esercizio: number;
  titolo_esercizio: string;
  cognome_paziente: string;
  nome_paziente: string;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Gestione della sessione tramite localStorage
    const sessione = localStorage.getItem("utente");

    if (!sessione) {
      router.push("/login");
      return;
    }

    const utenteObj = JSON.parse(sessione);
    const pIva = utenteObj.codice; // Recupero pIva dal localStorage

    const loadFeedbacks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/feedback?pIva=${encodeURIComponent(pIva)}`);
        if (!response.ok) {
          throw new Error('Errore nel caricamento dei feedback');
        }
        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        console.error("Errore nel caricamento dei feedback:", err);
        setError('Impossibile caricare i feedback');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbacks();
  }, [router]);

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="flex flex-col items-center w-full max-w-md mx-auto md:max-w-3xl">
        
        {/* Breadcrumb */}
        <div className="w-full mb-6">
          <Link 
            href="/logopedista/lista-pazienti"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium uppercase text-sm tracking-wider"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Torna alla lista pazienti
          </Link>
        </div>

        {/* Header */}
        <div className="w-full mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ChatBubbleLeftIcon className="w-8 h-8 text-yellow-400" />
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-yellow-400 font-bold`}>
              Feedback Pazienti
            </h1>
          </div>
          <p className="text-gray-500 mt-2">
            Visualizza tutti i feedback ricevuti dai tuoi pazienti sugli esercizi assegnati.
          </p>
        </div>

        {/* Contenuto */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Caricamento in corso...</div>
        ) : error ? (
          <div className="w-full bg-red-50 rounded-lg p-8 text-center border border-red-200">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="w-full space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.cod} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {feedback.titolo_esercizio}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Paziente: <span className="font-semibold">{feedback.cognome_paziente} {feedback.nome_paziente}</span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(feedback.data).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded p-4 border border-gray-100">
                  <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                    {feedback.messaggio || '(Nessun messaggio)'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/logopedista/lista-pazienti/dettaglio-paziente/${feedback.id_paziente}/esercizio/${feedback.id_esercizio}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-500 transition"
                  >
                    Vai all'esercizio
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Nessun feedback disponibile dai tuoi pazienti.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
