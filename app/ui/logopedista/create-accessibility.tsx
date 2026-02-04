'use client';

import { LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Props {
  isPublic: boolean;
  onChange: (val: boolean) => void;
}

export default function CreateAccessibility({ isPublic, onChange }: Props) {
  return (
    <div className="w-full pt-4">
      <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
        VISIBILITÀ ATTIVITÀ
      </label>
      
      <div className="flex gap-4">
        {/* Tasto PRIVATA */}
        <button
          onClick={() => onChange(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all group ${
            !isPublic
              ? 'bg-gray-800 border-gray-800 text-white shadow-lg scale-[1.02]'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          <LockClosedIcon className={`w-6 h-6 ${!isPublic ? 'text-yellow-400' : 'group-hover:text-gray-600'}`} />
          <div className="text-left">
            <span className="block font-bold text-sm uppercase tracking-wider">Privata</span>
            <span className="block text-[10px] font-medium opacity-70">Solo tu puoi vederla</span>
          </div>
        </button>

        {/* Tasto PUBBLICA */}
        <button
          onClick={() => onChange(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all group ${
            isPublic
              ? 'bg-green-600 border-green-600 text-white shadow-lg scale-[1.02]'
              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
          }`}
        >
          <GlobeAltIcon className={`w-6 h-6 ${isPublic ? 'text-white' : 'group-hover:text-green-600'}`} />
          <div className="text-left">
            <span className="block font-bold text-sm uppercase tracking-wider">Pubblica</span>
            <span className="block text-[10px] font-medium opacity-70">Visibile a tutti</span>
          </div>
        </button>
      </div>
    </div>
  );
}