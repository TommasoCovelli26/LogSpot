'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { lusitana } from '../../../ui/fonts';
import DetailImageViewer from '../../../ui/logopedista/detail-image-viewer';

interface ExerciseDetail {
  id: number;
  titolo: string;
  descrizione: string;
  istruzioni: string;
  immagine: string;
  fasciaEta: number;
  patologie: string;
  statoCompletamento: string | null;
  dataAssegnazione: string;
}

export default function ExerciseDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchExercise = async () => {
      try {
        const response = await fetch(`/api/esercizi/${id}`);
        
        if (!response.ok) {
          throw new Error('Esercizio non trovato');
        }
        
        const data = await response.json();
        setExercise(data);
      } catch (error) {
        console.error('Errore:', error);
        router.push('/paziente/esercizi');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id, router]);

  const handleUpdateStatus = async (status: string) => {
    if (!exercise || !id) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/esercizi/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statoCompletamento: status }),
      });

      if (!response.ok) {
        throw new Error("Errore nell'aggiornamento dello stato");
      }

      router.push('/paziente/esercizi');
    } catch (error) {
      console.error('Errore:', error);
      alert("Errore nell'aggiornamento dello stato");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Caricamento esercizio...</div>
      </div>
    );
  }

  if (!exercise) {
    return null;
  }

  const patologieList = exercise.patologie ? exercise.patologie.split(',') : [];
  const allegatiList = exercise.immagine ? exercise.immagine.split('|') : [];

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link 
          href="/paziente/esercizi"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna agli esercizi
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <h1 className={`${lusitana.className} text-4xl md:text-5xl font-bold text-blue-500`}>
            {exercise.titolo}
          </h1>
          
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${
              exercise.statoCompletamento === 'completato'
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {exercise.statoCompletamento === 'completato' ? 'Completato' : 'In Corso'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLONNA SINISTRA */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-400"></div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" /> Descrizione
            </h3>
            
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {exercise.descrizione || "Nessuna descrizione disponibile per questo esercizio."}
            </p>

            {allegatiList.length > 0 && (
              <DetailImageViewer images={allegatiList} />
            )}
          </div>

          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">
              Obiettivo Terapeutico
            </h3>
            <p className="text-blue-900 font-medium text-xl italic leading-relaxed">
              "{exercise.istruzioni || 'Nessun obiettivo specificato.'}"
            </p>
          </div>

          {/* PULSANTI AZIONI */}
          {exercise.statoCompletamento !== 'completato' && (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* TORNA INDIETRO (mantieni in corso) */}
              <button
                onClick={() => handleUpdateStatus('in-corso')}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold uppercase text-sm hover:bg-gray-200 transition shadow-md tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClockIcon className="w-5 h-5" />
                Salva e Continua Dopo
              </button>

              {/* COMPLETA ESERCIZIO */}
              <button
                onClick={() => handleUpdateStatus('completato')}
                disabled={updating}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-2xl font-bold uppercase text-sm hover:bg-green-600 transition shadow-md tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Completa Esercizio
              </button>
            </div>
          )}

          {/* MESSAGGIO ESERCIZIO COMPLETATO */}
          {exercise.statoCompletamento === 'completato' && (
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-green-50 text-green-700 rounded-2xl font-bold uppercase text-sm border-2 border-green-200">
              <CheckCircleIcon className="w-6 h-6" />
              Esercizio Completato
            </div>
          )}
        </div>

        {/* COLONNA DESTRA */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-400 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">
              Target Età
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-black text-blue-900 tracking-tight">
                {exercise.fasciaEta}
              </span>
              <span className="text-blue-700 font-bold uppercase text-sm">
                anni
              </span>
            </div>
            <div className="w-full bg-white h-3 rounded-full overflow-hidden relative border border-blue-200">
              <div 
                className="h-full bg-blue-400 rounded-full relative" 
                style={{ width: `${Math.min((exercise.fasciaEta / 123) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-4">
              Patologie Trattate
            </h3>
            <div className="flex flex-wrap gap-2">
              {patologieList.length > 0 ? (
                patologieList.map((pat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white text-blue-800 rounded-lg text-xs font-bold uppercase border border-blue-200 tracking-wide shadow-sm"
                  >
                    {pat.trim()}
                  </span>
                ))
              ) : (
                <span className="text-blue-600 text-sm italic">
                  Nessuna patologia specificata.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Assegnato il
              </p>
              <p className="text-sm font-bold text-gray-800">
                {new Date(exercise.dataAssegnazione).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
