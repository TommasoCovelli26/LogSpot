import { PhotoIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  textValue: string;
  onTextChange: (val: string) => void;
  files: string[];
  onAddFile: (files: FileList | null) => void;
  onRemoveFile: (fileName: string) => void;
}

export default function CreateDescription({ textValue, onTextChange, files, onAddFile, onRemoveFile }: Props) {
  return (
    <div className="relative w-full">
       <div className="border-2 border-gray-200 rounded-[2.5rem] p-6 md:p-8 min-h-[350px] flex flex-col relative bg-white transition hover:border-yellow-400 focus-within:border-yellow-400 group">
          
          {/* Placeholder centrale */}
          {!textValue && files.length === 0 && (
              <span className="absolute top-1/3 left-1/2 -translate-x-1/2 text-gray-400 font-bold tracking-widest uppercase pointer-events-none">
                  TESTO
              </span>
          )}

          {/* Textarea */}
          <textarea 
            className="w-full flex-1 outline-none text-black bg-transparent resize-none text-lg z-10 placeholder-transparent"
            placeholder="Scrivi qui..."
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
          />

          {/* Lista Allegati */}
          {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 z-20 mt-4">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full">
                      <PaperClipIcon className="w-4 h-4 text-yellow-700" />
                      <span className="text-sm font-bold text-yellow-800 truncate max-w-[150px]">{file}</span>
                      <button onClick={() => onRemoveFile(file)} className="hover:bg-yellow-200 rounded-full p-0.5 transition">
                          <XMarkIcon className="w-4 h-4 text-yellow-800"/>
                      </button>
                  </div>
                ))}
              </div>
          )}

          {/* Bottoni Upload (SOLO IMMAGINE) */}
          <div className="flex justify-center gap-12 items-center mt-4 px-4 text-gray-400 z-20 border-t border-gray-100 pt-4">
              <label className="flex flex-col items-center gap-1 cursor-pointer hover:text-yellow-500 transition hover:scale-110">
                  <PhotoIcon className="w-8 h-8" />
                  <span className="text-xs font-bold">Immagine</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => onAddFile(e.target.files)} />
              </label>
              
              {/* RIMOSSO IL TASTO FILE */}
          </div>
       </div>
    </div>
  );
}