// Direttiva 'use server': indica a Next.js che tutte le funzioni esportate da questo modulo
// sono Server Actions, eseguibili solo lato server e invocabili direttamente dal client
'use server';

// Importa revalidatePath per invalidare la cache delle pagine dopo le modifiche ai dati
import { revalidatePath } from 'next/cache';
// Importa redirect per effettuare reindirizzamenti lato server
import { redirect } from 'next/navigation';
// Importa la funzione cookies per accedere ai cookie HTTP della richiesta corrente
import { cookies } from 'next/headers';
// Importa l'istanza del database SQLite
import { db } from '@/lib/db';

// --- Funzione Helper per ottenere l'ID utente ---
/**
 * Recupera l'ID (P.IVA) del logopedista attualmente autenticato leggendo il cookie 'utente'.
 * @returns La P.IVA del logopedista se autenticato, oppure null
 */
async function getUserId() {
  // Accede allo store dei cookie della richiesta corrente
  const cookieStore = await cookies();
  // Cerca il cookie chiamato 'utente' che contiene i dati dell'utente loggato
  const userCookie = cookieStore.get('utente');
  
  // Se il cookie non esiste, l'utente non è autenticato: restituisce null
  if (!userCookie) return null;

  try {
    // Parsa il valore JSON del cookie per estrarre i dati dell'utente
    const userData = JSON.parse(userCookie.value);
    // Restituisce la P.IVA se è un logopedista, altrimenti null
    return userData.utente?.pIva || null;
  } catch (error) {
    // In caso di errore nel parsing del JSON, restituisce null
    return null;
  }
}

/* =====================================================
   FUNZIONI PREFERITI (CUORE)
===================================================== */

/**
 * Aggiunge o rimuove un'attività dai preferiti del logopedista corrente.
 * @param activityId - L'ID dell'attività da aggiungere/rimuovere dai preferiti
 * @param isFavorite - true per aggiungere ai preferiti, false per rimuovere
 * @returns Un oggetto con success: true/false e un eventuale messaggio di errore
 */
export async function toggleFavorite(activityId: number, isFavorite: boolean) {
  // Recupera l'ID del logopedista dal cookie
  const userId = await getUserId(); // <--- USA ID REALE

  // Se l'utente non è autenticato, restituisce errore
  if (!userId) return { success: false, error: 'Utente non autenticato' };

  try {
    if (isFavorite) {
      // Se isFavorite è true, inserisce un nuovo record nella tabella Preferiti
      // INSERT OR IGNORE evita errori se il preferito esiste già
      db.prepare(`
        INSERT OR IGNORE INTO Preferiti (id_logopedista, id_attivita)
        VALUES (?, ?)
      `).run(userId, activityId);
    } else {
      // Se isFavorite è false, rimuove il record dalla tabella Preferiti
      db.prepare(`
        DELETE FROM Preferiti
        WHERE id_logopedista = ? AND id_attivita = ?
      `).run(userId, activityId);
    }

    // Invalida la cache della pagina dei materiali per riflettere i cambiamenti
    revalidatePath('/logopedista/imieimateriali');
    // Restituisce successo
    return { success: true };

  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error('Errore aggiornamento preferiti:', error);
    // Restituisce un oggetto di errore
    return { success: false, error: 'Impossibile aggiornare i preferiti' };
  }
}

/* =====================================================
   SALVATAGGIO NUOVA ATTIVITÀ
===================================================== */

/**
 * Salva una nuova attività nel database, associandola al logopedista corrente.
 * @param formData - Oggetto contenente i dati del form: titolo, descrizione, immagine, obbiettivo, fasciaEta, patologie, accessibilita
 * @returns Un oggetto con success: true/false e un messaggio informativo
 */
export async function saveActivity(formData: any) {
  // Recupera l'ID del logopedista dal cookie
  const userId = await getUserId(); // <--- USA ID REALE

  // Se l'utente non è autenticato, restituisce errore
  if (!userId) return { success: false, message: 'Devi essere loggato per salvare' };

  try {
    // Destruttura i campi dal form data ricevuto
    const {
      titolo,        // Titolo dell'attività
      descrizione,   // Descrizione testuale
      immagine,      // URL/percorso immagine (già stringa separata da "|" se multipla)
      obbiettivo,    // Obiettivo/istruzioni dell'attività
      fasciaEta,     // Fascia d'età target
      patologie,     // Patologie target (può essere un array o una stringa)
      accessibilita  // Se true, l'attività sarà pubblica
    } = formData;

    // Converte l'array delle patologie in una stringa separata da virgole
    // Se è già una stringa, la usa così com'è
    const patologieString = Array.isArray(patologie)
      ? patologie.join(',')
      : patologie;

    // Inserisce la nuova attività nel database con tutti i campi
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
      titolo,                      // Titolo dell'attività
      descrizione,                 // Descrizione dell'attività
      obbiettivo,                  // Obiettivo (salvato nel campo 'istruzioni')
      immagine,                    // Immagine dell'attività
      fasciaEta,                   // Fascia d'età numerica
      patologieString,             // Patologie come stringa separata da virgole
      accessibilita ? 1 : 0,      // Converte il booleano in intero (1 = pubblica, 0 = privata)
      userId                       // P.IVA del logopedista creatore
    );

    // Invalida la cache della pagina dei materiali personali
    revalidatePath('/logopedista/imieimateriali');
    // Restituisce successo con messaggio informativo
    return { success: true, message: 'Attività salvata!' };

  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error('Errore salvataggio attività:', error);
    // Restituisce un oggetto di errore con messaggio
    return { success: false, message: 'Errore nel salvataggio' };
  }
}

/* =====================================================
   ASSEGNAZIONE / RIMOZIONE PAZIENTI
===================================================== */

/**
 * Assegna un paziente a un logopedista aggiornando il campo id_logopedista nella tabella Paziente.
 * @param cf - Il codice fiscale del paziente da assegnare
 * @param pIva - La Partita IVA del logopedista a cui assegnare il paziente
 * @returns Un oggetto con success: true/false e un eventuale messaggio di errore
 */
export async function assignPatientToLogopedist(cf: string, pIva: string) {
  // La pIva viene passata esplicitamente come parametro
  try {
    // Aggiorna il record del paziente impostando il logopedista assegnato
    db.prepare(`
      UPDATE Paziente
      SET id_logopedista = ?
      WHERE cf = ?
    `).run(pIva, cf);

    // Invalida la cache della pagina di accoppiamento paziente per riflettere i cambiamenti
    revalidatePath('/logopedista/lista-pazienti/accoppiamento-paziente');
    // Invalida anche la cache della lista pazienti generale
    revalidatePath('/logopedista/lista-pazienti');
    // Restituisce successo
    return { success: true };

  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error('Errore assegnazione paziente:', error);
    // Restituisce un oggetto di errore con messaggio
    return { success: false, error: 'Errore nell\'assegnazione del paziente' };
  }
}

/**
 * Rimuove l'assegnazione di un paziente dal suo logopedista (disaccoppiamento).
 * Imposta id_logopedista a NULL nella tabella Paziente.
 * @param cf - Il codice fiscale del paziente da disaccoppiare
 * @returns Un oggetto con success: true/false e un eventuale messaggio di errore
 */
export async function unassignPatient(cf: string) {
  try {
    // Aggiorna il record del paziente rimuovendo l'associazione con il logopedista (NULL)
    db.prepare(`
      UPDATE Paziente
      SET id_logopedista = NULL
      WHERE cf = ?
    `).run(cf);

    // Invalida la cache della lista pazienti
    revalidatePath('/logopedista/lista-pazienti');
    // Invalida la cache della pagina di dettaglio di questo specifico paziente
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
    // Restituisce successo
    return { success: true };

  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error('Errore disaccoppiamento paziente:', error);
    // Restituisce un oggetto di errore con messaggio
    return { success: false, error: 'Errore nel disaccoppiamento del paziente' };
  }
}

/* =====================================================
   ASSEGNAZIONE ATTIVITÀ PAZIENTI
===================================================== */

/**
 * Assegna un esercizio (attività) a un paziente specifico, creando un record nella tabella Esercizio.
 * @param patientCf - Il codice fiscale del paziente a cui assegnare l'esercizio
 * @param activityId - L'ID dell'attività da assegnare come esercizio
 * @returns Un oggetto con success: true/false e un messaggio informativo
 */
export async function assignExerciseToPatient(patientCf: string, activityId: number) {
  // 1. Recupera l'ID del logopedista dai cookie della richiesta
  const cookieStore = await cookies();
  // Cerca il cookie 'utente' che contiene i dati dell'utente loggato
  const userCookie = cookieStore.get('utente');
  
  // Se il cookie non esiste, l'utente non è loggato: restituisce errore
  if (!userCookie) return { success: false, message: "Utente non loggato" };
  
  // Variabile per memorizzare l'ID del logopedista
  let logopedistaId = '';
  try {
    // Parsa il JSON del cookie per estrarre i dati dell'utente
    const userData = JSON.parse(userCookie.value);
    // Estrae la P.IVA del logopedista dai dati dell'utente
    logopedistaId = userData.utente?.pIva;
  } catch (e) {
    // In caso di errore nel parsing, restituisce errore
    return { success: false, message: "Errore lettura cookie" };
  }

  // Se non è stato possibile recuperare l'ID del logopedista, restituisce errore
  if (!logopedistaId) return { success: false, message: "Dati utente non validi" };

  try {
    // 2. Inserisce il nuovo esercizio assegnato nel database
    // Imposta la data di assegnazione a oggi, lo stato a 'da-svolgere' e l'esito vuoto
    db.prepare(`
      INSERT INTO Esercizio (id_paziente, id_attivita, id_logopedista, dataAssegnazione, statoCompletamento, esito)
      VALUES (?, ?, ?, DATE('now'), 'da-svolgere', '')
    `).run(patientCf, activityId, logopedistaId);

    // 3. Aggiorna la cache delle pagine che mostrano dati dei pazienti
    // Invalida la cache della lista generale dei pazienti
    revalidatePath('/logopedista/lista-pazienti');
    
    // Invalida la cache della pagina di dettaglio del paziente specifico
    revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);

    // Restituisce successo con messaggio informativo
    return { success: true, message: "Esercizio assegnato con successo!" };

  } catch (error: any) {
    // Logga l'errore completo nella console per il debug
    console.error("Errore DB:", error);
    // Se l'errore è una violazione di unicità, significa che l'esercizio è già assegnato
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, message: "Questo esercizio è già assegnato." };
    }
    // Per qualsiasi altro errore, restituisce un messaggio generico
    return { success: false, message: "Errore durante l'assegnazione." };
  }
}

/* =====================================================
   ELIMINAZIONE ATTIVITÀ
===================================================== */

/**
 * Elimina un'attività dal database, verificando che appartenga al logopedista corrente.
 * Dopo l'eliminazione, reindirizza alla pagina dei materiali personali.
 * @param id - L'ID (cod) dell'attività da eliminare
 * @returns Un oggetto con success: false e messaggio se fallisce; in caso di successo, esegue un redirect
 */
export async function deleteActivity(id: number) {
  // Recupera l'ID del logopedista dal cookie
  const userId = await getUserId(); // <--- USA ID REALE

  // Se l'utente non è autenticato, restituisce errore di autorizzazione
  if (!userId) return { success: false, message: 'Non autorizzato' };

  try {
    // Elimina l'attività dal database solo se appartiene al logopedista corrente (doppio filtro per sicurezza)
    const result = db.prepare(`
      DELETE FROM Attivita 
      WHERE cod = ? AND id_logopedista = ?
    `).run(id, userId);

    // Se nessuna riga è stata eliminata, l'attività non esiste o non appartiene al logopedista
    if (result.changes === 0) {
      return { success: false, message: "Non puoi eliminare questa attività o non esiste." };
    }

    // Invalida la cache della pagina dei materiali personali
    revalidatePath('/logopedista/imieimateriali');
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error('Errore eliminazione:', error);
    // Restituisce un oggetto di errore con messaggio
    return { success: false, message: 'Errore durante l\'eliminazione' };
  }

  // Reindirizza l'utente alla pagina dei materiali personali dopo l'eliminazione
  redirect('/logopedista/imieimateriali');
}

/* =====================================================
   AGGIORNAMENTO ATTIVITÀ
===================================================== */

/**
 * Aggiorna i dati di un'attività esistente nel database.
 * Verifica che l'attività appartenga al logopedista corrente prima di procedere.
 * @param id - L'ID (cod) dell'attività da aggiornare
 * @param formData - Oggetto contenente i nuovi dati: titolo, descrizione, immagine, obbiettivo, fasciaEta, patologie, accessibilita
 * @returns Un oggetto con success: true/false e un messaggio informativo
 */
export async function updateActivity(id: number, formData: any) {
  // Recupera l'ID del logopedista dal cookie
  const userId = await getUserId(); // <--- USA ID REALE

  // Se l'utente non è autenticato, restituisce errore di autorizzazione
  if (!userId) return { success: false, message: 'Non autorizzato' };

  try {
    // Destruttura i campi dal form data ricevuto
    const {
      titolo,        // Nuovo titolo dell'attività
      descrizione,   // Nuova descrizione
      immagine,      // Nuovo URL/percorso immagine
      obbiettivo,    // Nuovo obiettivo/istruzioni
      fasciaEta,     // Nuova fascia d'età
      patologie,     // Nuove patologie target (array o stringa)
      accessibilita  // Nuovo stato di accessibilità/pubblicità
    } = formData;

    // Converte l'array delle patologie in stringa separata da virgole, se necessario
    const patologieString = Array.isArray(patologie)
      ? patologie.join(',')
      : patologie;

    // Aggiorna l'attività nel database con i nuovi valori
    // La clausola WHERE filtra sia per ID attività che per logopedista proprietario (sicurezza)
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
      titolo,                   // Nuovo titolo
      descrizione,              // Nuova descrizione
      obbiettivo,               // Nuovo obiettivo (campo 'istruzioni' nel DB)
      immagine,                 // Nuova immagine
      fasciaEta,                // Nuova fascia d'età
      patologieString,          // Nuove patologie come stringa
      accessibilita ? 1 : 0,   // Converte booleano in intero
      id,                       // ID dell'attività da aggiornare
      userId                    // P.IVA del logopedista proprietario (clausola di sicurezza)
    );

    // Invalida la cache della pagina di dettaglio di questa specifica attività
    revalidatePath(`/logopedista/imieimateriali/${id}`);
    // Invalida anche la cache della lista generica dei materiali
    revalidatePath('/logopedista/imieimateriali');
    // Restituisce successo con messaggio informativo
    return { success: true, message: 'Attività aggiornata!' };

  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error('Errore aggiornamento attività:', error);
    // Restituisce un oggetto di errore con messaggio
    return { success: false, message: 'Errore durante l\'aggiornamento' };
  }
}

/**
 * Rimuove un esercizio assegnato a un paziente eliminando il record dalla tabella Esercizio.
 * @param exerciseId - L'ID dell'esercizio da rimuovere
 * @param patientCf - Il codice fiscale del paziente (usato per invalidare la cache della pagina)
 * @returns Un oggetto con success: true/false e un messaggio informativo
 */
export async function removeAssignedExercise(exerciseId: number, patientCf: string) {
  try {
    // Elimina la riga dalla tabella Esercizio in base all'ID
    const info = db.prepare('DELETE FROM Esercizio WHERE id = ?').run(exerciseId);

    // Controlla se una riga è stata effettivamente eliminata
    if (info.changes > 0) {
      // Invalida la cache della pagina del paziente per riflettere la rimozione
      revalidatePath(`/logopedista/lista-pazienti/dettaglio-paziente/${patientCf}`);
      // Restituisce successo con messaggio informativo
      return { success: true, message: "Attività rimossa dal paziente." };
    } else {
      // Se nessuna riga è stata eliminata, l'esercizio non è stato trovato
      return { success: false, message: "Esercizio non trovato." };
    }
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore rimozione esercizio:", error);
    // Restituisce un oggetto di errore con messaggio
    return { success: false, message: "Errore durante la rimozione." };
  }
}

/* =====================================================
   GESTIONE COMMENTI
===================================================== */

/**
 * Aggiunge un nuovo commento a un'attività, associandolo al logopedista corrente.
 * @param activityId - L'ID dell'attività a cui aggiungere il commento
 * @param message - Il testo del commento da inserire
 * @returns Un oggetto con success: true/false e un eventuale messaggio di errore
 */
export async function addComment(activityId: number, message: string) {
  // Accede allo store dei cookie della richiesta corrente
  const cookieStore = await cookies();
  // Cerca il cookie 'utente' che contiene i dati dell'utente loggato
  const userCookie = cookieStore.get('utente');
  
  // Se il cookie non esiste, l'utente non è loggato
  if (!userCookie) return { success: false, message: "Non sei loggato" };
  
  try {
    // Parsa il JSON del cookie per estrarre l'ID del logopedista
    const userData = JSON.parse(userCookie.value);
    // Estrae la P.IVA del logopedista
    const userId = userData.utente?.pIva;

    // Inserisce il nuovo commento con data/ora corrente nel database
    db.prepare(`
      INSERT INTO Commento (messaggio, data, id_logopedista, id_attivita)
      VALUES (?, DATETIME('now'), ?, ?)
    `).run(message, userId, activityId);

    // Invalida la cache delle pagine in cui potrebbe essere visualizzato il commento
    revalidatePath(`/logopedista/ricerca-materiali/${activityId}`);
    revalidatePath(`/logopedista/imieimateriali/${activityId}`);
    // Restituisce successo
    return { success: true };
  } catch (e) {
    // Logga l'errore nella console per il debug
    console.error(e);
    // Restituisce errore generico
    return { success: false, message: "Errore DB" };
  }
}

/**
 * Modifica il testo di un commento esistente, verificando che appartenga al logopedista corrente.
 * Aggiorna anche la data del commento alla data/ora attuale.
 * @param commentId - L'ID del commento da modificare
 * @param newMessage - Il nuovo testo del commento
 * @returns Un oggetto con success: true/false e un eventuale messaggio di errore
 */
export async function editComment(commentId: number, newMessage: string) {
  // Accede allo store dei cookie della richiesta corrente
  const cookieStore = await cookies();
  // Cerca il cookie 'utente' che contiene i dati dell'utente loggato
  const userCookie = cookieStore.get('utente');

  // Controlla se il cookie esiste; se no, l'utente non è loggato
  if (!userCookie) return { success: false, message: "Non sei loggato" };

  try {
    // Parsa il JSON del cookie per estrarre l'ID del logopedista
    const userData = JSON.parse(userCookie.value);
    // Estrae la P.IVA del logopedista
    const userId = userData.utente?.pIva;

    // Aggiorna il commento nel database, verificando che appartenga al logopedista corrente
    // Aggiorna anche la data del commento alla data/ora corrente
    const result = db.prepare(`
      UPDATE Commento 
      SET messaggio = ?, data = DATETIME('now')
      WHERE cod = ? AND id_logopedista = ?
    `).run(newMessage, commentId, userId);

    // Se nessuna riga è stata aggiornata, il commento non esiste o non appartiene all'utente
    if (result.changes === 0) return { success: false, message: "Non autorizzato o commento non trovato" };

    // Restituisce successo
    return { success: true };
  } catch (e) {
    // Logga l'errore nella console per il debug
    console.error(e);
    // Restituisce errore generico
    return { success: false, message: "Errore modifica" };
  }
}

/**
 * Elimina un commento dal database, verificando che appartenga al logopedista corrente.
 * @param commentId - L'ID del commento da eliminare
 * @returns Un oggetto con success: true/false e un eventuale messaggio di errore
 */
export async function deleteComment(commentId: number) {
  // Accede allo store dei cookie della richiesta corrente
  const cookieStore = await cookies();
  // Cerca il cookie 'utente' che contiene i dati dell'utente loggato
  const userCookie = cookieStore.get('utente');

  // Controlla se il cookie esiste; se no, l'utente non è loggato
  if (!userCookie) return { success: false, message: "Non sei loggato" };

  try {
    // Parsa il JSON del cookie per estrarre l'ID del logopedista
    const userData = JSON.parse(userCookie.value);
    // Estrae la P.IVA del logopedista
    const userId = userData.utente?.pIva;

    // Elimina il commento dal database, verificando che appartenga al logopedista corrente
    const result = db.prepare(`
      DELETE FROM Commento 
      WHERE cod = ? AND id_logopedista = ?
    `).run(commentId, userId);

    // Se nessuna riga è stata eliminata, il commento non esiste o non appartiene all'utente
    if (result.changes === 0) return { success: false, message: "Non autorizzato o commento non trovato" };

    // Restituisce successo
    return { success: true };
  } catch (e) {
    // Logga l'errore nella console per il debug
    console.error(e);
    // Restituisce errore generico
    return { success: false, message: "Errore eliminazione" };
  }
}