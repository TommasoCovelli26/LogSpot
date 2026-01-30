'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

/* =====================================================
   FUNZIONI PREFERITI (CUORE)
===================================================== */

export async function toggleFavorite(activityId: number, isFavorite: boolean) {
  const userId = '12345678901'; // TODO: da sessione

  try {
    if (isFavorite) {
      db.prepare(`
        INSERT OR IGNORE INTO Preferiti (id_logopedista, id_attivita)
        VALUES (?, ?)
      `).run(userId, activityId);
    } else {
      db.prepare(`
        DELETE FROM Preferiti
        WHERE id_logopedista = ? AND id_attivita = ?
      `).run(userId, activityId);
    }

    revalidatePath('/logopedista/imieimateriali');
    return { success: true };

  } catch (error) {
    console.error('Errore aggiornamento preferiti:', error);
    return { success: false, error: 'Impossibile aggiornare i preferiti' };
  }
}

/* =====================================================
   SALVATAGGIO NUOVA ATTIVITÀ
===================================================== */

export async function saveActivity(formData: any) {
  const userId = '12345678901'; // TODO: da sessione

  try {
    const {
      titolo,
      descrizione,
      immagine,
      obbiettivo,
      fasciaEta,
      patologie,
      accessibilita
    } = formData;

    const patologieString = Array.isArray(patologie)
      ? patologie.join(',')
      : patologie;

    db.prepare(`
      INSERT INTO Attivita (
        titolo,
        descrizione,
        istruzioni,
        immagine,
        fasciaEta,
        patologie,
        accessibilita,
        id_logopedista
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      titolo,
      descrizione,
      obbiettivo,
      immagine,
      fasciaEta,
      patologieString,
      accessibilita ? 1 : 0,
      userId
    );

    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attività salvata!' };

  } catch (error) {
    console.error('Errore salvataggio attività:', error);
    return { success: false, message: 'Errore nel salvataggio' };
  }
}

/* =====================================================
   ASSEGNAZIONE / RIMOZIONE PAZIENTI
===================================================== */

export async function assignPatientToLogopedist(cf: string, pIva: string) {
  try {
    db.prepare(`
      UPDATE Paziente
      SET id_logopedista = ?
      WHERE cf = ?
    `).run(pIva, cf);

    revalidatePath('/logopedista/lista-pazienti/accoppiamento-paziente');
    revalidatePath('/logopedista/lista-pazienti');
    return { success: true };

  } catch (error) {
    console.error('Errore assegnazione paziente:', error);
    return { success: false, error: 'Errore nell\'assegnazione del paziente' };
  }
}

export async function unassignPatient(cf: string) {
  try {
    db.prepare(`
      UPDATE Paziente
      SET id_logopedista = NULL
      WHERE cf = ?
    `).run(cf);

    revalidatePath('/logopedista/lista-pazienti');
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
    return { success: true };

  } catch (error) {
    console.error('Errore disaccoppiamento paziente:', error);
    return { success: false, error: 'Errore nel disaccoppiamento del paziente' };
  }
}
