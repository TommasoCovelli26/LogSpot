export default function CreateSaveButton({ onSave, isSaving }: { onSave: () => void, isSaving: boolean }) {
  return (
    <div className="w-full pt-8 pb-12 flex justify-center">
        <button 
            onClick={onSave}
            disabled={isSaving}
            className="w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-black text-lg px-12 py-4 rounded-2xl font-bold shadow-lg transition disabled:opacity-50 uppercase tracking-widest transform hover:scale-105"
        >
            {isSaving ? 'Salvataggio in corso...' : 'SALVA ATTIVITÀ'}
        </button>
    </div>
  );
}