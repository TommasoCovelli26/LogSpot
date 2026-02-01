'use client';

import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ImageModal from '../image-modal'; // Importa il modale

interface Props {
  textValue: string;
  onTextChange: (val: string) => void;
  files: string[]; // Ora conterrà stringhe Base64 (data:image...)
  onAddFile: (files: FileList | null) => void;
  onRemoveFile: (fileData: string) => void;
}

export default function CreateDescription({ textValue, onTextChange, files, onAddFile, onRemoveFile }: Props) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <>
      {/* Modale per visualizzazione a schermo intero */}
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />

      <div className="relative w-full">
         <div className="border-2 border-gray-200 rounded-[2.5rem] p-6 md:p-8 min-h-[350px] flex flex-col relative bg-white transition hover:border-yellow-400 focus-within:border-yellow-400 group">
            
            {!textValue && files.length === 0 && (
                <span className="absolute top-1/3 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest uppercase pointer-events-none">
                    TESTO
                </span>
            )}

            <textarea 
              className="w-full flex-1 outline-none text-black bg-transparent resize-none text-lg z-10 placeholder-transparent"
              placeholder="Scrivi qui..."
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
            />

            {/* --- NUOVA LISTA MINIATURE --- */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4 z-20 mt-6 pt-4 border-t border-gray-100">
                  {files.map((fileData, idx) => (
                    <div key={idx} className="relative group/image">
                        {/* Miniatura Cliccabile */}
                        <img 
                          src={fileData} 
                          alt={`Allegato ${idx}`}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-yellow-300 shadow-sm cursor-pointer hover:opacity-90 transition"
                          onClick={() => setModalImage(fileData)} // Apre il modale
                        />
                        {/* Tasto Rimuovi (X) */}
                        <button 
                          onClick={() => onRemoveFile(fileData)} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover/image:opacity-100"
                        >
                            <XMarkIcon className="w-4 h-4"/>
                        </button>
                    </div>
                  ))}
                </div>
            )}

            <div className="flex justify-center gap-12 items-center mt-2 px-4 text-gray-400 z-20">
                <label className="flex flex-col items-center gap-1 cursor-pointer hover:text-yellow-500 transition hover:scale-110">
                    <PhotoIcon className="w-8 h-8" />
                    <span className="text-xs font-bold">Aggiungi Immagine</span>
                    {/* Accetta solo immagini */}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onAddFile(e.target.files)} />
                </label>
            </div>
         </div>
      </div>
    </>
  );
}