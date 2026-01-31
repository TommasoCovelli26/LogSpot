'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full flex items-center mb-2">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition font-bold uppercase text-sm tracking-wider"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Annulla e Torna indietro
      </button>
    </div>
  );
}