'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  XMarkIcon, 
  PhotoIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { saveActivity } from '../../lib/actions'; 

const PATOLOGIES_LIST = [
  "AFASIA", "DISARTRIA", "BALBUZIE", "APRASSIA", "ANOMIA", "DISFONIA", 
  "DISFAGIA", "RITARDO LINGUAGGIO"
];

export default function CreaAttivitaPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Stato del form
  const [formState, setFormState] = useState({
    titolo: '',
    descrizioneTesto: '',
    allegati: [] as string[], // Ora è un array per supportare più file
    obbiettivo: '',
    fasciaEta: 0,
    patologie: [] as string[],
    accessibilita: false 
  });

  const [searchPatologia, setSearchPatologia] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Gestione aggiunta file multipli
  const handleAddFile = (files: FileList | null) => {
    if (files && files[0]) {
      const fileName = files[0].name;
      // Evitiamo duplicati
      if (!formState.allegati.includes(fileName)) {
        setFormState(prev => ({
          ...prev,
          allegati: [...prev.allegati, fileName]
        }));
      }
    }
  };

  // Rimozione singolo file
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

    // Uniamo i nomi dei file in una stringa separata da virgole per salvarla nel DB (campo immagine)
    const allegatiString = formState.allegati.join(',');

    const dataToSave = {
      ...formState,
      descrizione: formState.descrizioneTesto, 
      immagine: allegatiString 
    };

    const res = await saveActivity(dataToSave);
    setIsSaving(false);
    
    if (res.success) {
      router.push('/logopedista/imieimateriali');
    } else {
      alert("Errore: " + res.message);
    }
  };

  const filteredPatologies = PATOLOGIES_LIST.filter(p => 
    p.toLowerCase().includes(searchPatologia.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-white text-black p-4 md:p-8 font-sans flex flex-col gap-8">
      
      {/* 1. TITOLO */}
      <div className="group w-full">
        <label className="block text-2xl font-bold text-gray-400 mb-2 uppercase">TITOLO</label>
        <input 
          type="text" 
          placeholder="Inserisci titolo..." 
          className="w-full text-xl font-medium text-black border-b border-gray-300 focus:border-yellow-400 outline-none py-2 bg-transparent transition placeholder-gray-300"
          value={formState.titolo}
          onChange={(e) => handleInputChange('titolo', e.target.value)}
        />
      </div>

      {/* 2. BOX DESCRIZIONE / MEDIA (Multi-file, No Video) */}
      <div className="relative w-full">
         <div className="border-2 border-gray-200 rounded-[2.5rem] p-6 md:p-8 min-h-[350px] flex flex-col relative bg-white transition hover:border-yellow-400 focus-within:border-yellow-400 group">
            
            {/* Etichetta centrale "TESTO" (visibile solo se tutto vuoto) */}
            {!formState.descrizioneTesto && formState.allegati.length === 0 && (
                <span className="absolute top-1/3 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest uppercase pointer-events-none">
                    TESTO
                </span>
            )}

            {/* Textarea */}
            <textarea 
              className="w-full flex-1 outline-none text-black bg-transparent resize-none text-lg z-10 placeholder-transparent"
              placeholder="Scrivi qui..."
              value={formState.descrizioneTesto}
              onChange={(e) => handleInputChange('descrizioneTesto', e.target.value)}
            />

            {/* Lista Allegati (Pillole Gialle) */}
            {formState.allegati.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 z-20 mt-4">
                  {formState.allegati.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
                        <PaperClipIcon className="w-4 h-4 text-yellow-700" />
                        <span className="text-sm font-bold text-yellow-800 truncate max-w-[150px]">{file}</span>
                        <button onClick={() => removeFile(file)} className="hover:bg-yellow-200 rounded-full p-0.5 transition">
                            <XMarkIcon className="w-4 h-4 text-yellow-800"/>
                        </button>
                    </div>
                  ))}
                </div>
            )}

            {/* Icone Media (Solo Immagine e File) */}
            <div className="flex justify-center gap-12 items-center mt-4 px-4 text-gray-400 z-20 border-t border-gray-100 pt-4">
                <label className="flex flex-col items-center gap-1 cursor-pointer hover:text-yellow-500 transition hover:scale-110">
                    <PhotoIcon className="w-8 h-8" />
                    <span className="text-xs font-bold">Immagine</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleAddFile(e.target.files)} />
                </label>
                
                <label className="flex flex-col items-center gap-1 cursor-pointer hover:text-yellow-500 transition hover:scale-110">
                    <DocumentTextIcon className="w-8 h-8" />
                    <span className="text-xs font-bold">File</span>
                    <input type="file" className="hidden" onChange={(e) => handleAddFile(e.target.files)} />
                </label>
            </div>
         </div>
      </div>

      {/* 3. FASCIA D'ETÀ */}
      <div className="w-full pt-2">
          <label className="block text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">FASCIA D'ETÀ</label>
          
          <div className="relative w-full h-12 flex items-center">
              <span className="absolute left-0 -bottom-6 text-xs font-bold text-gray-400">0</span>
              <span className="absolute right-0 -bottom-6 text-xs font-bold text-gray-400">123</span>

              <input 
                  type="range" 
                  min="0" 
                  max="123" 
                  value={formState.fasciaEta}
                  onChange={(e) => handleInputChange('fasciaEta', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10"
                  style={{
                      background: `linear-gradient(to right, #FACC15 0%, #FACC15 ${(formState.fasciaEta / 123) * 100}%, #e5e7eb ${(formState.fasciaEta / 123) * 100}%, #e5e7eb 100%)`
                  }}
              />

              {/* Bollino Giallo */}
              <div 
                  className="absolute top-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-xs shadow-md pointer-events-none transition-all duration-75 z-20"
                  style={{ 
                      left: `calc(${((formState.fasciaEta / 123) * 100)}% - 16px)`,
                      top: '-10px'
                  }}
              >
                  {formState.fasciaEta}
              </div>
              
              <style jsx>{`
                  input[type=range]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      height: 24px;
                      width: 24px;
                      background: transparent;
                      cursor: pointer;
                  }
                  input[type=range]::-moz-range-thumb {
                      height: 24px;
                      width: 24px;
                      background: transparent;
                      cursor: pointer;
                      border: none;
                  }
              `}</style>
          </div>
      </div>

      {/* 4. PATOLOGIA */}
      <div className="w-full pt-4">
          <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">PATOLOGIA</label>
          
          <div className="relative mb-6">
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                  type="text"
                  placeholder="CERCA..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-yellow-400 outline-none transition text-sm font-medium placeholder-gray-400 shadow-sm"
                  value={searchPatologia}
                  onChange={(e) => setSearchPatologia(e.target.value)}
              />
          </div>

          <div className="flex flex-wrap gap-3">
              {filteredPatologies.map((pat) => {
                  const isSelected = formState.patologie.includes(pat);
                  return (
                      <button
                          key={pat}
                          onClick={() => togglePatologia(pat)}
                          className={`px-6 py-2 rounded-full text-xs font-bold border transition uppercase tracking-wide ${
                              isSelected 
                              ? 'bg-yellow-400 border-yellow-400 text-black shadow-md transform scale-105' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-black'
                          }`}
                      >
                          {pat}
                      </button>
                  );
              })}
          </div>
      </div>

      {/* 5. OBBIETTIVO TERAPEUTICO */}
      <div className="w-full pt-4">
          <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">OBBIETTIVO TERAPEUTICO</label>
          <textarea 
              className="w-full p-4 border border-gray-200 rounded-2xl focus:border-yellow-400 outline-none text-black h-32 resize-none shadow-sm transition"
              placeholder="Scrivi l'obiettivo..."
              value={formState.obbiettivo}
              onChange={(e) => handleInputChange('obbiettivo', e.target.value)}
          />
      </div>

      {/* TASTO SALVATAGGIO IN BASSO */}
      <div className="w-full pt-8 pb-12 flex justify-center">
          <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-12 py-4 rounded-2xl font-bold shadow-lg transition disabled:opacity-50 uppercase tracking-widest transform hover:scale-105"
          >
              {isSaving ? 'Salvataggio in corso...' : 'SALVA ATTIVITÀ'}
          </button>
      </div>

    </div>
  );
}