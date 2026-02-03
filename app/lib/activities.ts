import { db } from '@/lib/db';

export interface ActivityWithFavorite {
  cod: number;
  titolo: string;
  dataCreazione: string;
  isFavorite: boolean;
}

export interface AssignedExercise {
  id: number;
  titolo: string;
  dataAssegnazione: string;
  statoCompletamento: string | null;
  esito: string | null;
  id_attivita: number;
}

export interface ActivityDetail {
  cod: number;
  titolo: string;
  descrizione: string;
  istruzioni: string;
  immagine: string;
  accessibilita: boolean;
  fasciaEta: number;
  patologie: string;
  id_logopedista: string;
}

export async function fetchActivities(
  userId: string, 
  query: string = '', 
  filter: string = 'recenti'
): Promise<ActivityWithFavorite[]> {
  try {
    // Base query
    // Selezioniamo le attività e usiamo un LEFT JOIN per vedere se sono nei preferiti dell'utente
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

    const params: any[] = [userId, userId];

    // 1. Filtro Ricerca
    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

    // 2. Filtro Tab (Preferiti) - CORREZIONE QUI
    // Invece di usare 'isFavorite', controlliamo se l'ID nella tabella unita esiste.
    if (filter === 'preferiti') {
      sql += ` AND P.id_attivita IS NOT NULL`;
    }

    sql += ` ORDER BY A.dataCreazione DESC`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      ...row,
      isFavorite: Boolean(row.isFavorite)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare le attività.');
  }
}

export async function fetchActivityById(id: string): Promise<ActivityDetail | null> {
  try {
    const stmt = db.prepare(`
      SELECT * FROM Attivita WHERE cod = ?
    `);
    
    const activity = stmt.get(id) as ActivityDetail | undefined;
    
    if (!activity) return null;

    return {
      ...activity,
      accessibilita: Boolean(activity.accessibilita)
    };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

export async function fetchAssignedExercises(
  patientCf: string,
  query: string = '',
  filter: string = 'tutti'
): Promise<AssignedExercise[]> {
  try {
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

    const params: any[] = [patientCf];

    // Filtro ricerca
    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

    // Filtro per stato
    if (filter === 'completati') {
      sql += ` AND E.statoCompletamento = 'completato'`;
    } else if (filter === 'in-corso') {
      sql += ` AND (E.statoCompletamento IS NULL OR E.statoCompletamento = 'in-corso')`;
    }

    sql += ` ORDER BY E.dataAssegnazione DESC`;

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as AssignedExercise[];

    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Impossibile recuperare gli esercizi assegnati.');
  }
}