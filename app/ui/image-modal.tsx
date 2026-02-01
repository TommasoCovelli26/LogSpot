'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

interface Props {
  src: string | null;
  onClose: () => void;
}

export default function ImageModal({ src, onClose }: Props) {
  // Chiudi con il tasto ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose} // Chiudi cliccando sullo sfondo
    >
      {/* Tasto Chiudi */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 rounded-full p-2 transition text-white"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>

      {/* Immagine a schermo intero */}
      <img 
        src={src} 
        alt="Full screen view" 
        className="max-w-full max-h-[90vh] object-contain rounded-lg cursor-default"
        onClick={(e) => e.stopPropagation()} // Evita la chiusura se si clicca sull'immagine stessa
      />
    </div>
  );
}