'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PATOLOGIES_LIST = [
  "AFASIA", "DISARTRIA", "BALBUZIE", "APRASSIA", "ANOMIA", "DISFONIA",
  "DISFAGIA", "RITARDO LINGUAGGIO"
];

export default function FiltersPathology() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [search, setSearch] = useState('');

  const currentPathologies = searchParams.get('pathologies')?.split(',').filter(Boolean) || [];

  const handleToggle = (pat: string) => {
    const params = new URLSearchParams(searchParams);
    const current = params.get('pathologies')?.split(',').filter(Boolean) || [];
    
    let newPathologies: string[];
    if (current.includes(pat)) {
      newPathologies = current.filter(p => p !== pat);
    } else {
      newPathologies = [...current, pat];
    }

    if (newPathologies.length > 0) {
      params.set('pathologies', newPathologies.join(','));
    } else {
      params.delete('pathologies');
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  const filtered = PATOLOGIES_LIST.filter(p =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full pt-4 mb-6">
      <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">
        PATOLOGIA
      </label>

      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="CERCA..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-yellow-400 outline-none transition text-sm font-medium placeholder-gray-400 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {filtered.map((pat) => {
          const isSelected = currentPathologies.includes(pat);
          return (
            <button
              key={pat}
              onClick={() => handleToggle(pat)}
              className={`px-6 py-2 rounded-full text-xs font-bold border transition uppercase tracking-wide ${
                isSelected
                  ? 'bg-yellow-500 border-yellow-500 text-black shadow-md transform scale-105'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-black'
              }`}
            >
              {pat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
