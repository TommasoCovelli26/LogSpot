'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveActivity } from '../../lib/actions'; 

// Importiamo i nuovi componenti
import CreateHeader from '../../ui/logopedista/create-header';
import CreateTitle from '../../ui/logopedista/create-title';
import CreateDescription from '../../ui/logopedista/create-description';
import CreateAge from '../../ui/logopedista/create-age';
import CreatePathology from '../../ui/logopedista/create-pathology';
import CreateObjective from '../../ui/logopedista/create-objective';
import CreateSaveButton from '../../ui/logopedista/create-save-button';

export default function CreaAttivitaPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Stato del form
  const [formState, setFormState] = useState({
    titolo: '',
    descrizioneTesto: '',
    allegati: [] as string[],
    obbiettivo: '',
    fasciaEta: 0,
    patologie: [] as string[],
    accessibilita: false 
  });

  // --- LOGICA DI SICUREZZA (Dirty Check & Back) ---
  const isDirty = 
    formState.titolo !== '' || 
    formState.descrizioneTesto !== '' || 
    formState.allegati.length > 0 ||
    formState.obbiettivo !== '' ||
    formState.patologie.length > 0;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSaving) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSaving]);

  const handleBack = () => {
    if (isDirty) {
      const confirmLeave = window.confirm("Hai delle modifiche non salvate. Se torni indietro, l'attività andrà persa. Sei sicuro?");
      if (!confirmLeave) return;
    }
    router.push('/logopedista/imieimateriali');
  };

  // --- LOGICA GESTIONE DATI ---
  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFile = (files: FileList | null) => {
    if (files && files[0]) {
      const fileName = files[0].name;
      if (!formState.allegati.includes(fileName)) {
        setFormState(prev => ({
          ...prev,
          allegati: [...prev.allegati, fileName]
        }));
      }
    }
  };

  const removeFile = (fileName: string) => {
    setFormState(prev => ({
      ...prev,
      allegati: prev.allegati.filter(f => f !== fileName)
    }));
  };

  const togglePatologia = (pat: string) => {
    const current = formState.patologie;
    const newPatologie = current.includes(pat) 
      ? current.filter(p => p !== pat) 
      : [...current, pat];
    handleInputChange('patologie', newPatologie);
  };

  const handleSave = async () => {
    if (!formState.titolo) return alert("Inserisci almeno il titolo.");
    setIsSaving(true);

    const dataToSave = {
      ...formState,
      descrizione: formState.descrizioneTesto, 
      immagine: formState.allegati.join(',') 
    };

    const res = await saveActivity(dataToSave);
    
    if (res.success) {
      router.push('/logopedista/imieimateriali');
    } else {
      setIsSaving(false);
      alert("Errore: " + res.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-black p-4 md:p-8 font-sans flex flex-col gap-8">
      
      {/* 1. HEADER */}
      <CreateHeader onBack={handleBack} />

      {/* 2. TITOLO */}
      <CreateTitle 
        value={formState.titolo} 
        onChange={(val) => handleInputChange('titolo', val)} 
      />

      {/* 3. DESCRIZIONE E ALLEGATI */}
      <CreateDescription 
        textValue={formState.descrizioneTesto}
        onTextChange={(val) => handleInputChange('descrizioneTesto', val)}
        files={formState.allegati}
        onAddFile={handleAddFile}
        onRemoveFile={removeFile}
      />

      {/* 4. ETÀ */}
      <CreateAge 
        value={formState.fasciaEta}
        onChange={(val) => handleInputChange('fasciaEta', val)}
      />

      {/* 5. PATOLOGIA */}
      <CreatePathology 
        selected={formState.patologie}
        onToggle={togglePatologia}
      />

      {/* 6. OBIETTIVO */}
      <CreateObjective 
        value={formState.obbiettivo}
        onChange={(val) => handleInputChange('obbiettivo', val)}
      />

      {/* 7. SALVA */}
      <CreateSaveButton 
        onSave={handleSave}
        isSaving={isSaving}
      />

    </div>
  );
}