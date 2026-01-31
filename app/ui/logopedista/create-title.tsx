export default function CreateTitle({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="group w-full">
      <label className="block text-2xl font-bold text-gray-400 mb-2 uppercase">TITOLO</label>
      <input 
        type="text" 
        placeholder="Inserisci titolo..." 
        className="w-full text-xl font-medium text-black border-b border-gray-300 focus:border-yellow-400 outline-none py-2 bg-transparent transition placeholder-gray-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}