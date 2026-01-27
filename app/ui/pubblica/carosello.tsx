'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { lusitana } from '../fonts';
import clsx from 'clsx';

const slides = [
  {
    text: "Spazio unico per la raccolta di documenti logopedici",
    src: "/logopedista.jpg",
  },
  {
    text: "Hub dove poter visualizzare tutte le attività dettagliate",
    src: "/paziente.jpg",
  },
  {
    text: "",
    src: "/paziente1.jpg",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  // Auto-play opzionale ogni 5 secondi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden rounded-xl shadow-lg">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={clsx(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            {
              "opacity-100 z-10": index === current,
              "opacity-0 z-0": index !== current,
            }
          )}
        >
          {/* Overlay scuro per far risaltare il testo */}
          {slide.text && (
            <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center p-8">
              <h2 className={`${lusitana.className} text-white text-center text-2xl md:text-4xl font-bold max-w-2xl`}>
                {slide.text}
              </h2>
            </div>
          )}
          
          <img
            src={slide.src}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Indicatori (Pallini) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={clsx(
              "w-3 h-3 rounded-full transition-colors",
              i === current ? "bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>

      {/* Pulsante Precedente */}
      <button
        onClick={() => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center z-30 transition-colors"
        aria-label="Precedente"
      >
        &#10094;
      </button>

      {/* Pulsante Successivo */}
      <button
        onClick={() => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center z-30 transition-colors"
        aria-label="Successivo"
      >
        &#10095;
      </button>
    </div>
  );
}