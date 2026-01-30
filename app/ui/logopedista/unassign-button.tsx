'use client';

import { unassignPatient } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function UnassignButton({ cf }: { cf: string }) {
  const router = useRouter();

  const handleUnassign = async () => {
    if (confirm('Sei sicuro di voler disaccoppiare questo paziente?')) {
      const result = await unassignPatient(cf);
      if (result.success) {
        router.push('/logopedista/lista-pazienti');
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <button
      onClick={handleUnassign}
      className="rounded-md bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700"
    >
      Disaccoppia
    </button>
  );
}
