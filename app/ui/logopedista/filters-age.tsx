'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function FiltersAge() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentAge = parseInt(searchParams.get('age') || '0');
  const maxAge = 123;

  const handleAgeChange = (age: number) => {
    const params = new URLSearchParams(searchParams);
    if (age > 0) {
      params.set('age', age.toString());
    } else {
      params.delete('age');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full pt-2 mb-6">
      <label className="block text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">
        FASCIA D'ETÀ {currentAge > 0 && `(${currentAge} anni)`}
      </label>

      <div className="relative w-full h-12 flex items-center">
        <span className="absolute left-0 -bottom-6 text-xs font-bold text-gray-400">0</span>
        <span className="absolute right-0 -bottom-6 text-xs font-bold text-gray-400">{maxAge}</span>

        <input
          type="range"
          min="0"
          max={maxAge}
          value={currentAge}
          onChange={(e) => handleAgeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10"
          style={{
            background: `linear-gradient(to right, #e1ff00 0%, #e1ff00 ${(currentAge / maxAge) * 100}%, #e5e7eb ${(currentAge / maxAge) * 100}%, #e5e7eb 100%)`
          }}
        />

        {currentAge > 0 && (
          <div
            className="absolute top-0 w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-xs shadow-md pointer-events-none transition-all duration-75 z-20"
            style={{
              left: `calc(${(currentAge / maxAge) * 100}% - 16px)`,
              top: '-10px'
            }}
          >
            {currentAge}
          </div>
        )}

        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            background: transparent;
            cursor: pointer;
          }
          input[type='range']::-moz-range-thumb {
            height: 24px;
            width: 24px;
            background: transparent;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </div>
    </div>
  );
}
