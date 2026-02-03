'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from '@heroicons/react/24/outline';
import FiltersAge from './filters-age';
import FiltersPathology from './filters-pathology';

export default function FiltersSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full mb-6">
      {/* Header espandibile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-50 hover:bg-gray-100 rounded-2xl p-4 border border-gray-200 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="text-lg font-bold text-gray-700 uppercase tracking-wider">
            Filtri avanzati
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
        )}
      </button>

      {/* Contenuto espandibile */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <FiltersAge />
          <FiltersPathology />
        </div>
      </div>
    </div>
  );
}
