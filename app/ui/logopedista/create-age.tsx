export default function CreateAge({ value, onChange }: { value: number, onChange: (val: number) => void }) {
  const maxAge = 123;
  
  return (
    <div className="w-full pt-2">
        <label className="block text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">FASCIA D'ETÀ</label>
        
        <div className="relative w-full h-12 flex items-center">
            <span className="absolute left-0 -bottom-6 text-xs font-bold text-gray-400">0</span>
            <span className="absolute right-0 -bottom-6 text-xs font-bold text-gray-400">{maxAge}</span>

            <input 
                type="range" 
                min="0" 
                max={maxAge} 
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer z-10"
                style={{
                    background: `linear-gradient(to right, #FACC15 0%, #FACC15 ${(value / maxAge) * 100}%, #e5e7eb ${(value / maxAge) * 100}%, #e5e7eb 100%)`
                }}
            />

            <div 
                className="absolute top-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-xs shadow-md pointer-events-none transition-all duration-75 z-20"
                style={{ 
                    left: `calc(${((value / maxAge) * 100)}% - 16px)`,
                    top: '-10px'
                }}
            >
                {value}
            </div>
            
            <style jsx>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 24px;
                    width: 24px;
                    background: transparent;
                    cursor: pointer;
                }
                input[type=range]::-moz-range-thumb {
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