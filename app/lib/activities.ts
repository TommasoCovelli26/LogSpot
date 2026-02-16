// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';

// Interfaccia TypeScript che rappresenta un'attività con il suo stato di preferito
export interface ActivityWithFavorite {
  cod: number;             // Codice univoco dell'attività (chiave primaria)
  titolo: string;          // Titolo dell'attività
  dataCreazione: string;   // Data di creazione dell'attività
  isFavorite: boolean;     // Indica se l'attività è tra i preferiti del logopedista corrente
}

// Interfaccia TypeScript che rappresenta un esercizio assegnato a un paziente
export interface AssignedExercise {
  id: number;                          // ID univoco dell'esercizio assegnato
  titolo: string;                      // Titolo dell'attività associata all'esercizio
  dataAssegnazione: string;            // Data in cui l'esercizio è stato assegnato al paziente
  statoCompletamento: string | null;   // Stato di completamento: 'da-svolgere', 'in-corso', 'completato' o null
  esito: string | null;               // Esito dell'esercizio (può essere null se non ancora completato)
  id_attivita: number;                // ID dell'attività collegata a questo esercizio
}

// Interfaccia TypeScript che rappresenta un commento su un'attività
export interface Comment {
  cod: number;                     // Codice univoco del commento (chiave primaria)
  messaggio: string;               // Testo del commento
  data: string;                    // Data e ora di creazione del commento
  id_logopedista: string;          // P.IVA del logopedista che ha scritto il commento
  nome_logopedista: string;        // Nome del logopedista autore del commento
  cognome_logopedista: string;     // Cognome del logopedista autore del commento
}

// Interfaccia TypeScript che rappresenta il dettaglio completo di un'attività
export interface ActivityDetail {
  cod: number;                         // Codice univoco dell'attività
  titolo: string;                      // Titolo dell'attività
  descrizione: string;                 // Descrizione testuale dell'attività
  istruzioni: string;                  // Istruzioni / obiettivo dell'attività
  immagine: string;                    // URL o percorso dell'immagine associata (stringhe separate da "|" se multiple)
  accessibilita: boolean;              // Se true, l'attività è pubblica e visibile a tutti i logopedisti
  fasciaEta: number;                   // Fascia d'età consigliata per l'attività
  patologie: string;                   // Patologie target, separate da virgola
  id_logopedista: string;              // P.IVA del logopedista che ha creato l'attività
  // Campi opzionali per il nome del creatore dell'attività (popolati tramite JOIN)
  nome_logopedista?: string;           // Nome del logopedista creatore (opzionale)
  cognome_logopedista?: string;        // Cognome del logopedista creatore (opzionale)
}

/**
 * Recupera le attività create da un logopedista specifico, con supporto per ricerca e filtri.
 * @param userId - La P.IVA del logopedista di cui recuperare le attività
 * @param query - Termine di ricerca opzionale per filtrare per titolo
 * @param filter - Tipo di filtro: 'recenti' (default) o 'preferiti'
 * @returns Un array di attività con informazione sui preferiti, ordinate per data di creazione decrescente
 */
export async function fetchActivities(
  userId: string, 
  query: string = '', 
  filter: string = 'recenti'
): Promise<ActivityWithFavorite[]> {
  try {
    // Query SQL di base: seleziona le attività del logopedista con LEFT JOIN sulla tabella Preferiti
    // La CASE verifica se esiste un record nei Preferiti per determinare se l'attività è tra i preferiti
    let sql = `
      SELECT 
        A.cod, 
        A.titolo, 
        A.dataCreazione,
        (CASE WHEN P.id_attivita IS NOT NULL THEN 1 ELSE 0 END) as isFavorite
      FROM Attivita A
      LEFT JOIN Preferiti P ON A.cod = P.id_attivita AND P.id_logopedista = ?
      WHERE A.id_logopedista = ?
    `;

    // Array dei parametri: userId viene usato sia per il JOIN Preferiti che per il filtro WHERE
    const params: any[] = [userId, userId];

    // Se è presente un termine di ricerca, aggiunge un filtro LIKE sul titolo
    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      // Aggiunge il termine con wildcard per la ricerca parziale
      params.push(`%${query}%`);
    }

    // Se il filtro è 'preferiti', mostra solo le attività che hanno un record nella tabella Preferiti
    if (filter === 'preferiti') {
      sql += ` AND P.id_attivita IS NOT NULL`;
    }

    // Ordina i risultati per data di creazione dalla più recente alla più vecchia
    sql += ` ORDER BY A.dataCreazione DESC`;

    // Prepara ed esegue la query SQL con i parametri
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    // Mappa i risultati convertendo il campo isFavorite da numero (0/1) a booleano (false/true)
    return rows.map(row => ({
      ...row,                              // Copia tutti i campi della riga
      isFavorite: Boolean(row.isFavorite)  // Converte 0/1 in false/true
    }));
  } catch (error) {
    // Logga l'errore e lancia un'eccezione con un messaggio leggibile
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare le attività.');
  }
}

/**
 * Recupera le attività pubbliche (accessibilità = 1) con supporto per ricerca, filtri, età e patologie.
 * @param userId - La P.IVA del logopedista corrente (per verificare i preferiti)
 * @param query - Termine di ricerca opzionale per filtrare per titolo
 * @param filter - Tipo di filtro: 'recenti' (default) o 'preferiti'
 * @param age - Fascia d'età opzionale per filtrare le attività adatte
 * @param pathologies - Array opzionale di patologie per filtrare le attività pertinenti
 * @returns Un array di attività pubbliche con informazione sui preferiti
 */
export async function fetchPublicActivities(
  userId: string,
  query: string = '',
  filter: string = 'recenti',
  age?: number,
  pathologies?: string[]
): Promise<ActivityWithFavorite[]> {
  try {
    // Query SQL base: seleziona le attività pubbliche (accessibilita = 1) con LEFT JOIN sui Preferiti
    let sql = `
      SELECT 
        A.cod, 
        A.titolo, 
        A.dataCreazione,
        (CASE WHEN P.id_attivita IS NOT NULL THEN 1 ELSE 0 END) as isFavorite
      FROM Attivita A
      LEFT JOIN Preferiti P ON A.cod = P.id_attivita AND P.id_logopedista = ?
      WHERE A.accessibilita = 1
    `;

    // Array dei parametri: inizia con l'userId per il JOIN sui Preferiti
    const params: any[] = [userId];

    // Se è presente un termine di ricerca, aggiunge un filtro LIKE sul titolo
    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

    // Se è specificata un'età valida (maggiore di 0), filtra le attività con fasciaEta adatta
    if (age && age > 0) {
      sql += ` AND A.fasciaEta <= ?`;
      params.push(age);
    }

    // Se sono specificate delle patologie, aggiunge condizioni OR per ciascuna patologia
    if (pathologies && pathologies.length > 0) {
      // Crea una condizione LIKE per ogni patologia nell'array
      const pathologyConditions = pathologies.map(() => `A.patologie LIKE ?`).join(' OR ');
      // Racchiude le condizioni in parentesi e le aggiunge con AND
      sql += ` AND (${pathologyConditions})`;
      // Aggiunge ogni patologia come parametro con wildcard per la ricerca parziale
      pathologies.forEach(pat => params.push(`%${pat}%`));
    }

    // Se il filtro è 'preferiti', mostra solo le attività segnate come preferite
    if (filter === 'preferiti') {
      sql += ` AND P.id_attivita IS NOT NULL`;
    }

    // Ordina i risultati dalla data di creazione più recente
    sql += ` ORDER BY A.dataCreazione DESC`;

    // Prepara ed esegue la query SQL con tutti i parametri raccolti
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    // Mappa i risultati convertendo isFavorite da intero a booleano
    return rows.map(row => ({
      ...row,                              // Copia tutti i campi della riga
      isFavorite: Boolean(row.isFavorite)  // Converte 0/1 in false/true
    }));
  } catch (error) {
    // Logga l'errore e lancia un'eccezione con messaggio leggibile
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare le attività pubbliche.');
  }
}

/**
 * Recupera il dettaglio completo di un'attività specifica tramite il suo ID,
 * includendo anche il nome e cognome del logopedista creatore tramite JOIN.
 * @param id - L'ID (cod) dell'attività da recuperare
 * @returns L'oggetto ActivityDetail con tutti i dettagli, oppure null se non trovata
 */
export async function fetchActivityById(id: string): Promise<ActivityDetail | null> {
  try {
    // Prepara la query SQL con LEFT JOIN sulla tabella Logopedista per ottenere nome e cognome del creatore
    const stmt = db.prepare(`
      SELECT 
        Attivita.*,
        Logopedista.nome AS nome_logopedista, 
        Logopedista.cognome AS cognome_logopedista
      FROM Attivita
      LEFT JOIN Logopedista ON Attivita.id_logopedista = Logopedista.pIva
      WHERE Attivita.cod = ?
    `);
    
    // Esegue la query e recupera il singolo risultato (get restituisce una sola riga o undefined)
    const activity = stmt.get(id) as ActivityDetail | undefined;
    
    // Se non è stata trovata nessuna attività con quell'ID, restituisce null
    if (!activity) return null;

    // Restituisce l'attività convertendo il campo accessibilita da intero (0/1) a booleano
    return {
      ...activity,                                 // Copia tutti i campi dell'attività
      accessibilita: Boolean(activity.accessibilita) // Converte 0/1 in false/true
    };
  } catch (error) {
    // Logga l'errore e restituisce null in caso di problemi
    console.error('Database Error:', error);
    return null;
  }
}

/**
 * Recupera gli esercizi assegnati a un paziente specifico, con supporto per ricerca e filtri.
 * @param patientCf - Il codice fiscale del paziente di cui recuperare gli esercizi
 * @param query - Termine di ricerca opzionale per filtrare per titolo
 * @param filter - Tipo di filtro: 'tutti' (default), 'completati' o 'in-corso'
 * @returns Un array di esercizi assegnati ordinati per data di assegnazione decrescente
 */
export async function fetchAssignedExercises(
  patientCf: string,
  query: string = '',
  filter: string = 'tutti'
): Promise<AssignedExercise[]> {
  try {
    // Query SQL base: seleziona gli esercizi con INNER JOIN su Attivita per ottenere il titolo
    let sql = `
      SELECT 
        E.id,
        A.titolo,
        E.dataAssegnazione,
        E.statoCompletamento,
        E.esito,
        E.id_attivita
      FROM Esercizio E
      INNER JOIN Attivita A ON E.id_attivita = A.cod
      WHERE E.id_paziente = ?
    `;

    // Array dei parametri: inizia con il codice fiscale del paziente
    const params: any[] = [patientCf];

    // Se è presente un termine di ricerca, filtra per titolo dell'attività
    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

    // Applica il filtro sullo stato di completamento
    if (filter === 'completati') {
      // Mostra solo gli esercizi con stato 'completato'
      sql += ` AND E.statoCompletamento = 'completato'`;
    } else if (filter === 'in-corso') {
      // Mostra gli esercizi con stato null (non iniziati) o 'in-corso'
      sql += ` AND (E.statoCompletamento IS NULL OR E.statoCompletamento = 'in-corso')`;
    }

    // Ordina i risultati per data di assegnazione dalla più recente
    sql += ` ORDER BY E.dataAssegnazione DESC`;

    // Prepara ed esegue la query SQL con i parametri
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as AssignedExercise[];

    // Restituisce direttamente l'array di esercizi assegnati
    return rows;
  } catch (error) {
    // Logga l'errore e lancia un'eccezione con messaggio leggibile
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare gli esercizi assegnati.');
  }
}

/**
 * Recupera tutti i commenti associati a un'attività specifica,
 * includendo nome e cognome del logopedista autore di ciascun commento.
 * @param activityId - L'ID dell'attività di cui recuperare i commenti
 * @returns Un array di commenti ordinati per data decrescente, o un array vuoto in caso di errore
 */
export async function fetchCommentsByActivityId(activityId: number): Promise<Comment[]> {
  try {
    // Prepara la query SQL con JOIN sulla tabella Logopedista per ottenere i dati dell'autore
    // I commenti sono ordinati dal più recente al più vecchio
    const comments = db.prepare(`
      SELECT 
        C.cod,
        C.messaggio,
        C.data,
        C.id_logopedista,
        L.nome AS nome_logopedista,
        L.cognome AS cognome_logopedista
      FROM Commento C
      JOIN Logopedista L ON C.id_logopedista = L.pIva
      WHERE C.id_attivita = ?
      ORDER BY C.data DESC
    `).all(activityId) as any[];

    // Restituisce l'array dei commenti
    return comments;
  } catch (error) {
    // Logga l'errore e restituisce un array vuoto come fallback sicuro
    console.error('Errore fetch commenti:', error);
    return [];
  }
}