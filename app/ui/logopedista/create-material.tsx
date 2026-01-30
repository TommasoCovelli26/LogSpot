import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function CreateMaterialButton() {
  return (
    <div className="w-full flex flex-col items-center mb-8 mt-4">
      <div className="relative mb-4">
        {/* Icona Computer stilizzata */}
        <div className="w-32 h-24 border-4 border-yellow-400 rounded-xl flex items-center justify-center bg-gray-50 shadow-sm">
          <PlusIcon className="w-10 h-10 text-yellow-500" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-400 rounded-full"></div>
      </div>

      <Link href="/logopedista/crea">
        <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 transition-colors text-black font-bold py-3 px-8 rounded-xl shadow-md text-lg">
          <PlusIcon className="w-6 h-6" />
          NUOVA ATTIVITÀ
        </button>
      </Link>
    </div>
  );
}