'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ExercisesTabs() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'tutti';

  const tabs = [
    { key: 'tutti', label: 'Tutti' },
    { key: 'in-corso', label: 'In Corso' },
    { key: 'completati', label: 'Completati' },
  ];

  return (
    <div className="flex gap-2 mb-6 w-full">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`?filter=${tab.key}`}
          className={`flex-1 py-2 text-center font-semibold rounded-lg transition ${
            filter === tab.key
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
