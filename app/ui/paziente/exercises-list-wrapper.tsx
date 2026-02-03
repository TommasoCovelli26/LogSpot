'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ExercisesList from './exercises-list';
import { AssignedExercise } from '../../lib/activities';

export default function ExercisesListWrapper({ patientCf }: { patientCf: string }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const filter = searchParams.get('filter') || 'tutti';
  
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/esercizi?cf=${patientCf}&query=${encodeURIComponent(query)}&filter=${filter}`
        );
        
        if (!response.ok) {
          throw new Error('Errore nel caricamento degli esercizi');
        }
        
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error('Errore:', error);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [patientCf, query, filter]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Caricamento esercizi...
      </div>
    );
  }

  return <ExercisesList exercises={exercises} />;
}
