'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function MaterialsTabs() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentFilter = searchParams.get('filter') || 'recenti';

  const handleTabChange = (filter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', filter);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 mb-6 w-full overflow-x-auto pb-2 justify-center md:justify-start">
      <button
        onClick={() => handleTabChange('recenti')}
        className={clsx(
          "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
          currentFilter === 'recenti' 
            ? "bg-yellow-400 text-black shadow-md" 
            : "bg-white text-gray-400 border border-gray-200"
        )}
      >
        RECENTI
      </button>
      <button
        onClick={() => handleTabChange('preferiti')}
        className={clsx(
          "px-6 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap",
          currentFilter === 'preferiti' 
            ? "bg-yellow-400 text-black shadow-md" 
            : "bg-white text-gray-400 border border-gray-200"
        )}
      >
        PREFERITI
      </button>
    </div>
  );
}