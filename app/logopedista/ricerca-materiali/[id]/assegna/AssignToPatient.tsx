'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assignExerciseToPatient } from '@/lib/actions';

interface Patient {
  cf: string;
  nome: string;
  cognome: string;
}

interface Props {
  // Accetta sia numeri che stringhe per compatibilità
  activityId: number | string;
  // ORA È OBBLIGATORIO: Riceve la lista pazienti dal genitore
  patients: Patient[];
}

export default function AssignToPatient({ activityId, patients }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(patients || []);
  const [assignedIds, setAssignedIds] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Carica le assegnazioni esistenti all'avvio
  useEffect(() => {
    const loadAssignedPatients = async () => {
      try {
        const sessione = localStorage.getItem("utente");
        if (!sessione) return;

        const utenteObj = JSON.parse(sessione);
        const pIva = utenteObj.codice;

        const response = await fetch(`/api/esercizi/assign/${activityId}?pIva=${encodeURIComponent(pIva)}`);
        if (response.ok) {
          const data = await response.json();
          const assigned: Record<string, boolean> = {};
          data.assignedCFs.forEach((cf: string) => {
            assigned[cf] = true;
          });
          setAssignedIds(assigned);
        }
      } catch (error) {
        console.error('Errore nel caricamento delle assegnazioni:', error);
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    loadAssignedPatients();
  }, [activityId]);

  // Filtra i pazienti quando scrivi nella barra di ricerca
  useEffect(() => {
    if (!patients) return;
    
    if (query.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lowerQ = query.toLowerCase();
      const filtered = patients.filter(p => 
        p.nome.toLowerCase().includes(lowerQ) || 
        p.cognome.toLowerCase().includes(lowerQ) ||
        p.cf.toLowerCase().includes(lowerQ)
      );
      setFilteredPatients(filtered);
    }
  }, [query, patients]);

  const handleAssign = async (cf: string) => {
    if (isAssigning) return;
    setIsAssigning(true);
    setMessage(null);
    
    // Server Action per assegnare
    const result = await assignExerciseToPatient(cf, Number(activityId));

    if (result.success) {
      setMessage('Attività assegnata con successo!');
      setAssignedIds((prev) => ({ ...prev, [cf]: true }));
      router.refresh(); 
    } else {
      setMessage(result.message || 'Errore durante l\'assegnazione.');
      if (result.message?.includes('già assegnato')) {
        setAssignedIds((prev) => ({ ...prev, [cf]: true }));
      }
    }
    setIsAssigning(false);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
        Assegna a paziente
      </label>

      {/* BARRA DI RICERCA (Stile Originale) */}
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o cognome"
          className="flex-1 pl-4 pr-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-yellow-400 transition"
        />
        <button
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-bold hover:bg-yellow-500 transition"
        >
          Cerca
        </button>
      </div>

      {/* LISTA PAZIENTI (Stile Originale) */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="text-sm text-gray-400 italic">Nessun paziente trovato.</div>
        ) : (
          filteredPatients.map((p) => (
            <div key={p.cf} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3 hover:border-yellow-200 transition shadow-sm">
              <div>
                <div className="font-bold text-gray-800">{p.nome} {p.cognome}</div>
                <div className="text-xs text-gray-500">{p.cf}</div>
              </div>
              <div>
                <button
                  onClick={() => handleAssign(p.cf)}
                  disabled={!!assignedIds[p.cf] || isAssigning || isLoadingAssignments}
                  className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide transition ${
                    assignedIds[p.cf] 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : isLoadingAssignments
                      ? 'bg-gray-200 text-gray-400 cursor-wait'
                      : 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm'
                  }`}
                >
                  {isLoadingAssignments ? '...' : assignedIds[p.cf] ? 'Assegnato' : 'Assegna'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-bold ${
          message.includes('successo') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}