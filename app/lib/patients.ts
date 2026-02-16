// Direttiva 'use server': indica a Next.js che questo modulo contiene funzioni eseguibili solo lato server
'use server';

// Importa l'istanza del database SQLite dal modulo db locale
import { db } from '@/lib/db';

// Interfaccia TypeScript che definisce la struttura di un oggetto Paziente
export interface Patient {
  cf: string;                    // Codice fiscale del paziente (chiave primaria)
  nome: string;                  // Nome del paziente
  cognome: string;               // Cognome del paziente
  email: string;                 // Indirizzo email del paziente
  numTelefono: string | null;    // Numero di telefono (opzionale, può essere null)
  dataNascita: string | null;    // Data di nascita (opzionale, può essere null)
}

/**
 * Recupera la lista dei pazienti assegnati a un determinato logopedista.
 * @param pIva - La Partita IVA del logopedista di cui recuperare i pazienti
 * @param query - Termine di ricerca opzionale per filtrare per nome o cognome
 * @returns Un array di oggetti Patient ordinati per cognome e nome in ordine ascendente
 */
export async function fetchPatients(pIva: string, query?: string): Promise<Patient[]> {
  try {
    // Query SQL base: seleziona i dati del paziente filtrando per il logopedista assegnato
    let sql = `
      SELECT cf, nome, cognome, email, numTelefono, dataNascita
      FROM Paziente
      WHERE id_logopedista = ?
    `;
    // Array dei parametri per la query preparata; inizia con la P.IVA del logopedista
    const params: any[] = [pIva];

    // Se è presente un termine di ricerca non vuoto, aggiunge un filtro su nome o cognome
    if (query && query.trim()) {
      sql += ` AND (nome LIKE ? OR cognome LIKE ?)`;
      // Crea il termine di ricerca con wildcard per la ricerca parziale (LIKE)
      const searchTerm = `%${query}%`;
      // Aggiunge il termine di ricerca due volte: una per il nome e una per il cognome
      params.push(searchTerm, searchTerm);
    }

    // Aggiunge l'ordinamento: prima per cognome, poi per nome, entrambi in ordine ascendente
    sql += ` ORDER BY cognome ASC, nome ASC`;

    // Prepara la query SQL (compilazione preventiva per sicurezza e performance)
    const stmt = db.prepare(sql);
    // Esegue la query con i parametri e fa il cast del risultato al tipo Patient[]
    const patients = stmt.all(...params) as Patient[];
    // Restituisce l'array di pazienti trovati
    return patients;
  } catch (error) {
    // Logga l'errore nella console in caso di problemi con il database
    console.error('Error fetching patients:', error);
    // Rilancia l'errore per gestirlo nel chiamante
    throw error;
  }
}

/**
 * Recupera un singolo paziente cercandolo per codice fiscale.
 * @param cf - Il codice fiscale del paziente da cercare
 * @returns L'oggetto Patient trovato, oppure null se non esiste
 */
export async function fetchPatientsByCf(cf: string): Promise<Patient | null> {
  try {
    // Prepara la query SQL per selezionare un paziente specifico, filtrato per codice fiscale
    const stmt = db.prepare(`
      SELECT cf, nome, cognome, email, numTelefono, dataNascita
      FROM Paziente
      WHERE cf = ?
    `);
    // Esegue la query e recupera il primo risultato (get restituisce una sola riga)
    const patient = stmt.get(cf) as Patient | undefined;
    // Restituisce il paziente se trovato, altrimenti null
    return patient || null;
  } catch (error) {
    // Logga l'errore nella console in caso di problemi
    console.error('Error fetching patient:', error);
    // Rilancia l'errore per gestirlo nel chiamante
    throw error;
  }
}

/**
 * Recupera tutti i pazienti non ancora assegnati a nessun logopedista.
 * @param query - Termine di ricerca opzionale per filtrare per CF, nome o cognome
 * @returns Un array di pazienti non assegnati, ordinati per cognome e nome
 */
export async function fetchUnassignedPatients(query?: string): Promise<Patient[]> {
  try {
    // Query SQL base: seleziona i pazienti che non hanno un logopedista assegnato (id_logopedista è NULL)
    let sql = `
      SELECT cf, nome, cognome, email, numTelefono, dataNascita
      FROM Paziente
      WHERE id_logopedista IS NULL
    `;
    // Array vuoto per i parametri della query
    const params: any[] = [];

    // Se è presente un termine di ricerca non vuoto, aggiunge un filtro su CF, nome o cognome
    if (query && query.trim()) {
      // Usa LOWER() per una ricerca case-insensitive su codice fiscale, nome e cognome
      sql += ` AND (LOWER(cf) LIKE LOWER(?) OR LOWER(nome) LIKE LOWER(?) OR LOWER(cognome) LIKE LOWER(?))`;
      // Crea il termine di ricerca con wildcard per la ricerca parziale
      const searchTerm = `%${query}%`;
      // Aggiunge il termine di ricerca tre volte: una per CF, una per nome, una per cognome
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Aggiunge l'ordinamento: prima per cognome, poi per nome, entrambi in ordine ascendente
    sql += ` ORDER BY cognome ASC, nome ASC`;

    // Prepara la query SQL compilata
    const stmt = db.prepare(sql);
    // Esegue la query e fa il cast del risultato a Patient[]
    const patients = stmt.all(...params) as Patient[];
    // Logga nella console la query, i parametri e il numero di risultati per debug
    console.log('fetchUnassignedPatients - Query:', sql, 'Params:', params, 'Results count:', patients.length);
    // Restituisce l'array dei pazienti non assegnati
    return patients;
  } catch (error) {
    // Logga l'errore nella console in caso di problemi
    console.error('Error fetching unassigned patients:', error);
    // Rilancia l'errore per gestirlo nel chiamante
    throw error;
  }
}
