"use client";

import { useEffect, useState } from 'react';

export default function AssignToPatient({ activityId }: { activityId: string }) {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [assignedIds, setAssignedIds] = useState<Record<string, boolean>>({});

  const getPIvaFromLocal = () => {
    try {
      const s = localStorage.getItem('utente');
      if (!s) return null;
      const obj = JSON.parse(s);
      return obj.codice || obj?.utente?.codice || null;
    } catch (e) {
      return null;
    }
  };

  const fetchPatients = async (q = '') => {
    const pIva = getPIvaFromLocal();
    if (!pIva) {
      setMessage('Logopedista non autenticato');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/lista-pazienti?pIva=${encodeURIComponent(pIva)}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) setPatients(data);
      else setMessage(data.error || 'Errore nel recupero pazienti');
    } catch (e) {
      setMessage('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAssign = async (cf: string) => {
    setMessage(null);
    const pIva = getPIvaFromLocal();
    if (!pIva) {
      setMessage('Logopedista non autenticato');
      return;
    }

    try {
      const res = await fetch('/api/esercizi/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cf, id_attivita: activityId, pIva })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Attività assegnata con successo');
        // disabilita il pulsante per questo paziente
        setAssignedIds((s) => ({ ...s, [cf]: true }));
      } else {
        setMessage(data.error || 'Errore assegnazione');
        if (res.status === 409) {
          // Se conflitto (attività già assegnata globalmente), disabilitiamo i pulsanti
          setAssignedIds((s) => ({ ...s, [cf]: true }));
        }
      }
    } catch (e) {
      setMessage('Errore di rete');
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Assegna a paziente</label>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o cognome"
          className="flex-1 pl-4 pr-3 py-2 rounded-lg border border-gray-200"
        />
        <button
          onClick={() => fetchPatients(query)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold"
        >
          Cerca
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Caricamento pazienti...</div>
      ) : (
        <div className="space-y-2">
          {patients.length === 0 ? (
            <div className="text-sm text-gray-400 italic">Nessun paziente trovato.</div>
          ) : (
            patients.map((p) => (
              <div key={p.cf} className="flex items-center justify-between bg-white border rounded-lg p-3">
                <div>
                  <div className="font-bold">{p.nome} {p.cognome}</div>
                  <div className="text-xs text-gray-500">{p.cf} • {p.email || p.numTelefono}</div>
                </div>
                <div>
                  <button
                    onClick={() => handleAssign(p.cf)}
                    disabled={!!assignedIds[p.cf]}
                    className={`px-3 py-1 rounded-full font-bold text-sm ${assignedIds[p.cf] ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-yellow-400 text-black'}`}
                  >
                    {assignedIds[p.cf] ? 'Assegnato' : 'Assegna'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {message && <div className="mt-3 text-sm text-center text-gray-700">{message}</div>}
    </div>
  );
}
