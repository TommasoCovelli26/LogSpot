'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

// --- Funzione Helper per ottenere l'ID utente ---
async function getUserId() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  
  if (!userCookie) return null;

  try {
    const userData = JSON.parse(userCookie.value);
    // Restituisce la P.IVA se è logopedista
    return userData.utente?.pIva || null;
  } catch (error) {
    return null;
  }
}

/* =====================================================
   FUNZIONI PREFERITI (CUORE)
===================================================== */

export async function toggleFavorite(activityId: number, isFavorite: boolean) {
  const userId = await getUserId(); // <--- USA ID REALE

  if (!userId) return { success: false, error: 'Utente non autenticato' };

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
  const userId = await getUserId(); // <--- USA ID REALE

  if (!userId) return { success: false, message: 'Devi essere loggato per salvare' };

  try {
    const {
      titolo,
      descrizione,
      immagine, // Riceve già la stringa separata da "|" dal form
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
  // Qui pIva viene passata esplicitamente, ma potremmo verificarla per sicurezza
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

/* =====================================================
   ASSEGNAZIONE ATTIVITÀ PAZIENTI
===================================================== */

export async function assignExerciseToPatient(patientCf: string, activityId: number) {
  // 1. Recupera ID logopedista dai COOKIE
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  
  if (!userCookie) return { success: false, message: "Utente non loggato" };
  
  let logopedistaId = '';
  try {
    const userData = JSON.parse(userCookie.value);
    logopedistaId = userData.utente?.pIva;
  } catch (e) {
    return { success: false, message: "Errore lettura cookie" };
  }

  if (!logopedistaId) return { success: false, message: "Dati utente non validi" };

  try {
    // 2. Inserimento nel DB
    db.prepare(`
      INSERT INTO Esercizio (id_paziente, id_attivita, id_logopedista, dataAssegnazione, statoCompletamento, esito)
      VALUES (?, ?, ?, DATE('now'), 'da-svolgere', '')
    `).run(patientCf, activityId, logopedistaId);

    // 3. AGGIORNA LA CACHE (La parte importante)
    // Aggiorna la lista generale
    revalidatePath('/logopedista/lista-pazienti');
    
    // Aggiorna la pagina specifica del paziente (QUESTA MANCAVA)
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);

    return { success: true, message: "Esercizio assegnato con successo!" };

  } catch (error: any) {
    console.error("Errore DB:", error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, message: "Questo esercizio è già assegnato." };
    }
    return { success: false, message: "Errore durante l'assegnazione." };
  }
}

/* =====================================================
   ELIMINAZIONE ATTIVITÀ
===================================================== */

export async function deleteActivity(id: number) {
  const userId = await getUserId(); // <--- USA ID REALE

  if (!userId) return { success: false, message: 'Non autorizzato' };

  try {
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

  redirect('/logopedista/imieimateriali');
}

/* =====================================================
   AGGIORNAMENTO ATTIVITÀ
===================================================== */
export async function updateActivity(id: number, formData: any) {
  const userId = await getUserId(); // <--- USA ID REALE

  if (!userId) return { success: false, message: 'Non autorizzato' };

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

    revalidatePath(`/logopedista/imieimateriali/${id}`);
    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attività aggiornata!' };

  } catch (error) {
    console.error('Errore aggiornamento attività:', error);
    return { success: false, message: 'Errore durante l\'aggiornamento' };
  }
}

export async function removeAssignedExercise(exerciseId: number, patientCf: string) {
  try {
    // Elimina la riga dalla tabella Esercizio
    const info = db.prepare('DELETE FROM Esercizio WHERE id = ?').run(exerciseId);

    if (info.changes > 0) {
      // Aggiorna la cache della pagina del paziente
      revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
      return { success: true, message: "Attività rimossa dal paziente." };
    } else {
      return { success: false, message: "Esercizio non trovato." };
    }
  } catch (error) {
    console.error("Errore rimozione esercizio:", error);
    return { success: false, message: "Errore durante la rimozione." };
  }
}