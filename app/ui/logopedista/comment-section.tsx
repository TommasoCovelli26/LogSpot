'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserCircleIcon, 
  PaperAirplaneIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';
import { Comment } from '@/lib/activities'; // Assicurati che l'interface sia esportata
import { addComment, editComment, deleteComment } from '@/lib/actions';

interface Props {
  activityId: number;
  comments: Comment[];
  currentUserPiva: string;
  isPublic: boolean; // Se false, nascondiamo il form di aggiunta (solo lettura)
}

export default function CommentSection({ activityId, comments, currentUserPiva, isPublic }: Props) {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stato per la modifica
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // --- AGGIUNTA COMMENTO ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    const res = await addComment(activityId, newMessage);
    if (res.success) {
      setNewMessage('');
      router.refresh(); // Ricarica i dati per mostrare il nuovo commento
    } else {
      alert("Errore nell'invio del commento");
    }
    setIsSubmitting(false);
  };

  // --- ELIMINAZIONE COMMENTO ---
  const handleDelete = async (commentId: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
    
    const res = await deleteComment(commentId);
    if (res.success) {
      router.refresh();
    } else {
      alert("Errore durante l'eliminazione");
    }
  };

  // --- MODIFICA COMMENTO ---
  const startEdit = (c: Comment) => {
    setEditingId(c.cod);
    setEditText(c.messaggio);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (commentId: number) => {
    if (!editText.trim()) return;
    
    const res = await editComment(commentId, editText);
    if (res.success) {
      setEditingId(null);
      router.refresh();
    } else {
      alert("Errore durante la modifica");
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-200 mt-8">
      <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
        Commenti <span className="text-sm font-normal text-yellow-400 bg-white px-2 py-0.5 rounded-full border">
          {comments.length}
        </span>
      </h3>

      {/* LISTA COMMENTI */}
      <div className="space-y-6 mb-8">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">Nessun commento presente.</p>
        ) : (
          comments.map((c) => (
            <div key={c.cod} className="flex gap-4 group">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-yellow-400 shadow-sm text-yellow-400">
                  <UserCircleIcon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex-grow bg-white p-4 rounded-xl rounded-tl-none border border-gray-100 shadow-sm relative">
                {/* Header Commento */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">
                      {c.nome_logopedista} {c.cognome_logopedista}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {new Date(c.data).toLocaleString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Azioni Autore (Modifica/Elimina) */}
                  {c.id_logopedista === currentUserPiva && !editingId && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(c)} className="p-1 text-gray-400 hover:text-yellow-500 transition" title="Modifica">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.cod)} className="p-1 text-gray-400 hover:text-red-600 transition" title="Elimina">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenuto Commento */}
                {editingId === c.cod ? (
                  // FORM DI MODIFICA IN-PLACE
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 text-sm border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none mb-2 bg-yellow-50/50"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="text-xs text-black hover:text-gray-700 font-bold px-3 py-1 bg-gray-100 rounded-lg">
                        Annulla
                      </button>
                      <button onClick={() => saveEdit(c.cod)} className="text-xs text-black bg-yellow-400 hover:bg-yellow-500 font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" /> Salva
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {c.messaggio}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM NUOVO COMMENTO (Solo se pubblica) */}
      {isPublic && (
        <form onSubmit={handleAdd} className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Lascia un commento</label>
          <div className="relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi qui il tuo commento..."
              className="w-full p-4 pr-12 rounded-xl border border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-50 outline-none transition resize-none shadow-sm"
              rows={3}
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newMessage.trim()}
              className="absolute bottom-3 right-3 p-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 disabled:bg-gray-300 transition shadow-sm"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 ml-1">
            Il commento sarà visibile a tutti gli utenti che visualizzano questa attività.
          </p>
        </form>
      )}
    </div>
  );
}