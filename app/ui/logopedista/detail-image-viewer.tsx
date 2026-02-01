'use client';

import { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ImageModal from '../image-modal';

export default function DetailImageViewer({ images }: { images: string[] }) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
      
      <div className="mt-10 pt-6 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-6 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5" /> Immagini Allegate ({images.length})
        </h4>
        <div className="flex flex-wrap gap-4">
            {images.map((imgData, idx) => (
                <img 
                  key={idx} 
                  src={imgData}
                  alt={`Allegato ${idx + 1}`}
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-yellow-200 shadow-sm cursor-pointer hover:opacity-90 hover:scale-105 transition bg-white"
                  onClick={() => setModalImage(imgData)}
                />
            ))}
        </div>
    </div>
    </>
  );
}