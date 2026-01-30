'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export async function assignPatientToLogopedist(cf: string, pIva: string) {
  try {
    const stmt = db.prepare(`
      UPDATE Paziente
      SET id_logopedista = ?
      WHERE cf = ?
    `);
    stmt.run(pIva, cf);
    revalidatePath('/logopedista/lista-pazienti/accoppiamento-paziente');
    revalidatePath('/logopedista/lista-pazienti');
    return { success: true };
  } catch (error) {
    console.error('Error assigning patient:', error);
    return { success: false, error: 'Errore nell\'assegnazione del paziente' };
  }
}

export async function unassignPatient(cf: string) {
  try {
    const stmt = db.prepare(`
      UPDATE Paziente
      SET id_logopedista = NULL
      WHERE cf = ?
    `);
    stmt.run(cf);
    revalidatePath('/logopedista/lista-pazienti');
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
    return { success: true };
  } catch (error) {
    console.error('Error unassigning patient:', error);
    return { success: false, error: 'Errore nel disaccoppiamento del paziente' };
  }
}