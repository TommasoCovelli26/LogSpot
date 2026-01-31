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

export async function deleteActivity(id: number) {
  const userId = '12345678901'; // Demo ID

  try {
    // Verifichiamo che l'attività appartenga all'utente prima di eliminare
    const result = db.prepare(`
      DELETE FROM Attivita 
      WHERE cod = ? AND id_logopedista = ?
    `).run(id, userId);

    if (result.changes === 0) {
      return { success: false, message: "Non puoi eliminare questa attività o non esiste." };
    }

    revalidatePath('/logopedista/imieimateriali');
  } catch (error) {
    console.error('Errore eliminazione:', error);
    return { success: false, message: 'Errore durante l\'eliminazione' };
  }

  // Il redirect va fatto fuori dal try-catch in Next.js server actions
  redirect('/logopedista/imieimateriali');
}

/* =====================================================
   AGGIORNAMENTO ATTIVITÀ
===================================================== */
export async function updateActivity(id: number, formData: any) {
  const userId = '12345678901';

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
      UPDATE Attivita
      SET 
        titolo = ?,
        descrizione = ?,
        istruzioni = ?,
        immagine = ?,
        fasciaEta = ?,
        patologie = ?,
        accessibilita = ?
      WHERE cod = ? AND id_logopedista = ?
    `).run(
      titolo,
      descrizione,
      obbiettivo,
      immagine,
      fasciaEta,
      patologieString,
      accessibilita ? 1 : 0,
      id,
      userId
    );

    revalidatePath(`/logopedista/imieimateriali/${id}`); // Aggiorna la pagina dettaglio
    revalidatePath('/logopedista/imieimateriali');       // Aggiorna la lista
    return { success: true, message: 'Attività aggiornata!' };

  } catch (error) {
    console.error('Errore aggiornamento attività:', error);
    return { success: false, message: 'Errore durante l\'aggiornamento' };
  }
}
