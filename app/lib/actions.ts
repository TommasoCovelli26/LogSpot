'use server';

import Database from 'better-sqlite3';
import path from 'path';
import { revalidatePath } from 'next/cache';

// Percorso del database SQLite
const dbPath = path.join(process.cwd(), 'app/data/database.db');

// --- FUNZIONE PER I PREFERITI (Cuore) ---
export async function toggleFavorite(activityId: number, isFavorite: boolean) {
  const db = new Database(dbPath);
  // ID fisso per demo (in produzione verrebbe dalla sessione)
  const userId = '12345678901'; 

  try {
    if (isFavorite) {
      // Aggiunge ai preferiti
      db.prepare(`
        INSERT OR IGNORE INTO Preferiti (id_logopedista, id_attivita) 
        VALUES (?, ?)
      `).run(userId, activityId);
    } else {
      // Rimuove dai preferiti
      db.prepare(`
        DELETE FROM Preferiti 
        WHERE id_logopedista = ? AND id_attivita = ?
      `).run(userId, activityId);
    }

    // Aggiorna la cache per mostrare subito il cambiamento
    revalidatePath('/logopedista/imieimateriali');
    
  } catch (error) {
    console.error('Errore aggiornamento preferiti:', error);
    // Non blocchiamo l'interfaccia se fallisce il log, ma lo segnaliamo
    throw new Error('Impossibile aggiornare i preferiti');
  }
}

// --- FUNZIONE PER SALVARE NUOVA ATTIVITÀ ---
export async function saveActivity(formData: any) {
  const db = new Database(dbPath);
  const userId = '12345678901'; 

  try {
    const { 
      titolo, 
      descrizione, 
      immagine,    // IMPORTANTE: Include la stringa degli allegati
      obbiettivo, 
      fasciaEta, 
      patologie, 
      accessibilita 
    } = formData;

    // Convertiamo l'array di patologie in stringa (es. "AFASIA,DISARTRIA")
    const patologieString = Array.isArray(patologie) ? patologie.join(',') : patologie;

    db.prepare(`
      INSERT INTO Attivita (
        titolo, descrizione, istruzioni, immagine, fasciaEta, patologie, accessibilita, id_logopedista
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

    // Aggiorna la lista dei materiali
    revalidatePath('/logopedista/imieimateriali');
    return { success: true, message: 'Attività salvata!' };

  } catch (error) {
    console.error('Errore salvataggio:', error);
    return { success: false, message: 'Errore nel salvataggio' };
  }
}