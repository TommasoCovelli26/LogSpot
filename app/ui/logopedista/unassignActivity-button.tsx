'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { removeAssignedExercise } from '@/lib/actions';
import { useRouter } from 'next/navigation';

export default function UnassignButton({ exerciseId, patientCf }: { exerciseId: number, patientCf: string }) {
  const router = useRouter();

  const handleRemove = async () => {
    const confirm = window.confirm("Sei sicuro di voler rimuovere questa attività dal piano del paziente?");
    if (!confirm) return;

    const res = await removeAssignedExercise(exerciseId, patientCf);
    if (res.success) {
      alert("Attività rimossa correttamente.");
      // Torna indietro alla lista del paziente
      router.push(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
    } else {
      alert("Errore: " + res.message);
    }
  };

  return (
    <button 
      onClick={handleRemove}
      className="w-full mt-12 flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
    >
      <TrashIcon className="w-5 h-5" />
      Rimuovi Attività
    </button>
  );
}