export default function CreateObjective({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="w-full pt-4">
        <label className="block text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">OBBIETTIVO TERAPEUTICO</label>
        <textarea 
            className="w-full p-4 border border-gray-200 rounded-2xl focus:border-yellow-400 outline-none text-black h-32 resize-none shadow-sm transition"
            placeholder="Scrivi l'obiettivo..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
  );
}