'use client';

import { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { toggleFavorite } from '../../lib/actions';

export default function FavoriteHeart({ cod, initialStatus }: { cod: number, initialStatus: boolean }) {
  const [isFavorite, setIsFavorite] = useState(initialStatus);

  const handleClick = async () => {
    // Optimistic update
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    try {
      await toggleFavorite(cod, newStatus);
    } catch (e) {
      console.error("Errore preferiti");
      setIsFavorite(!newStatus); // Rollback
    }
  };

  return (
    <button 
      onClick={(e) => {
          e.stopPropagation();
          handleClick();
      }}
      className="focus:outline-none transition-transform active:scale-110"
    >
      {isFavorite ? (
        <HeartSolid className="w-6 h-6 text-red-500" />
      ) : (
        <HeartOutline className="w-6 h-6 text-gray-300 hover:text-red-400" />
      )}
    </button>
  );
}