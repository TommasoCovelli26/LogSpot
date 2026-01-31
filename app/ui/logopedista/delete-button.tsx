'use client';

import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteActivity } from '../../lib/actions';
import { useState } from 'react';

export default function DeleteActivityButton({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirm = window.confirm("Sei sicuro di voler eliminare definitivamente questa attività?");
    if (!confirm) return;

    setIsDeleting(true);
    // Chiamiamo la server action
    await deleteActivity(id);
    // Non serve settare false perché la pagina cambierà
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full mt-12 flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 font-bold py-4 rounded-xl transition-all uppercase tracking-widest"
    >
      {isDeleting ? (
        <span>Eliminazione in corso...</span>
      ) : (
        <>
          <TrashIcon className="w-6 h-6" />
          Elimina Attività
        </>
      )}
    </button>
  );
}