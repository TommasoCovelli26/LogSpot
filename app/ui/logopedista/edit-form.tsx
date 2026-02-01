'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateActivity } from '../../lib/actions';
import { ActivityDetail } from '../../lib/activities';

// Importiamo i componenti UI
import CreateHeader from './create-header';
import CreateTitle from './create-title';
import CreateDescription from './create-description';
import CreateAge from './create-age';
import CreatePathology from './create-pathology';
import CreateObjective from './create-objective';

export default function EditForm({ activity }: { activity: ActivityDetail }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Inizializziamo lo stato con i dati del DB
  const [formState, setFormState] = useState({
    titolo: activity.titolo,
    descrizioneTesto: activity.descrizione || '',
    allegati: activity.immagine ? activity.immagine.split('|').filter(Boolean) : [],
    obbiettivo: activity.istruzioni || '',
    fasciaEta: activity.fasciaEta,
    patologie: activity.patologie ? activity.patologie.split(',').filter(Boolean) : [],
    accessibilita: activity.accessibilita
  });

  // --- 1. CALCOLO MODIFICHE (DIRTY CHECK) ---
  // Confrontiamo i valori attuali con quelli originali del database
  const isDirty = 
    formState.titolo !== activity.titolo ||
    formState.descrizioneTesto !== (activity.descrizione || '') ||
    formState.obbiettivo !== (activity.istruzioni || '') ||
    formState.fasciaEta !== activity.fasciaEta ||
    formState.accessibilita !== activity.accessibilita ||
    formState.allegati.join('|') !== (activity.immagine || '') ||
    formState.patologie.join(',') !== (activity.patologie || '');

  // --- 2. PROTEZIONE CHIUSURA BROWSER ---
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSaving) {
        e.preventDefault();
        e.returnValue = ''; // Standard browser per mostrare il popup
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSaving]);

  // --- 3. GESTIONE TASTO INDIETRO ---
  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("Hai modificato l'attività ma non hai salvato. Se torni indietro, le modifiche andranno perse. Sei sicuro?");
      if (!confirmLeave) return;
    }
    // Se non ci sono modifiche o l'utente ha confermato, torniamo indietro
    router.back();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFile = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      // Controllo di sicurezza basilare: è un'immagine?
      if (!file.type.startsWith('image/')) {
        alert("Per favore carica solo file immagine.");
        return;
      }

      const reader = new FileReader();
      
      reader.onloadend = () => {
        // reader.result contiene la stringa base64 dell'immagine
        const base64String = reader.result as string;

        // Evitiamo duplicati esatti
        if (!formState.allegati.includes(base64String)) {
          setFormState(prev => ({
            ...prev,
            allegati: [...prev.allegati, base64String]
          }));
        }
      };

      // Legge il file e scatena l'onloadend
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fileData: string) => {
    setFormState(prev => ({
      ...prev,
      allegati: prev.allegati.filter(f => f !== fileData)
    }));
  };

  const togglePatologia = (pat: string) => {
    const current = formState.patologie;
    const newPatologie = current.includes(pat) 
      ? current.filter(p => p !== pat) 
      : [...current, pat];
    handleInputChange('patologie', newPatologie);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const dataToSave = {
      ...formState,
      descrizione: formState.descrizioneTesto, 
      immagine: formState.allegati.join('|') 
    };

    const res = await updateActivity(activity.cod, dataToSave);
    
    if (res.success) {
      // Reindirizziamo al dettaglio
      router.push(`/logopedista/imieimateriali/${activity.cod}`);
    } else {
      setIsSaving(false);
      alert("Errore: " + res.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER: Passiamo la nostra funzione handleBack personalizzata */}
      <CreateHeader onBack={handleBack} />

      <CreateTitle 
        value={formState.titolo} 
        onChange={(val) => handleInputChange('titolo', val)} 
      />

      <CreateDescription 
        textValue={formState.descrizioneTesto}
        onTextChange={(val) => handleInputChange('descrizioneTesto', val)}
        files={formState.allegati}
        onAddFile={handleAddFile}
        onRemoveFile={removeFile}
      />

      <CreateAge 
        value={formState.fasciaEta}
        onChange={(val) => handleInputChange('fasciaEta', val)}
      />

      <CreatePathology 
        selected={formState.patologie}
        onToggle={togglePatologia}
      />

      <CreateObjective 
        value={formState.obbiettivo}
        onChange={(val) => handleInputChange('obbiettivo', val)}
      />

      <div className="w-full pt-8 pb-12 flex justify-center">
          <button 
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-12 py-4 rounded-2xl font-bold shadow-lg transition disabled:opacity-50 uppercase tracking-widest transform hover:scale-105"
          >
              {isSaving ? 'Aggiornamento...' : 'AGGIORNA ATTIVITÀ'}
          </button>
      </div>
    </div>
  );
}