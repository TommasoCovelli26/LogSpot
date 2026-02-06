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

export interface Comment {
  cod: number;
  messaggio: string;
  data: string;
  id_logopedista: string;
  nome_logopedista: string;
  cognome_logopedista: string;
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
  // MODIFICA 1: Aggiunti campi opzionali per il nome del creatore
  nome_logopedista?: string;
  cognome_logopedista?: string;
}

export async function fetchActivities(
  userId: string, 
  query: string = '', 
  filter: string = 'recenti'
): Promise<ActivityWithFavorite[]> {
  try {
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

    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

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

export async function fetchPublicActivities(
  userId: string,
  query: string = '',
  filter: string = 'recenti',
  age?: number,
  pathologies?: string[]
): Promise<ActivityWithFavorite[]> {
  try {
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

    const params: any[] = [userId];

    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

    if (age && age > 0) {
      sql += ` AND A.fasciaEta <= ?`;
      params.push(age);
    }

    if (pathologies && pathologies.length > 0) {
      const pathologyConditions = pathologies.map(() => `A.patologie LIKE ?`).join(' OR ');
      sql += ` AND (${pathologyConditions})`;
      pathologies.forEach(pat => params.push(`%${pat}%`));
    }

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
    throw new Error('Impossibile recuperare le attività pubbliche.');
  }
}

// MODIFICA 2: Aggiornata la query per recuperare anche il nome del logopedista
export async function fetchActivityById(id: string): Promise<ActivityDetail | null> {
  try {
    const stmt = db.prepare(`
      SELECT 
        Attivita.*,
        Logopedista.nome AS nome_logopedista, 
        Logopedista.cognome AS cognome_logopedista
      FROM Attivita
      LEFT JOIN Logopedista ON Attivita.id_logopedista = Logopedista.pIva
      WHERE Attivita.cod = ?
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

    if (query) {
      sql += ` AND A.titolo LIKE ?`;
      params.push(`%${query}%`);
    }

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

export async function fetchCommentsByActivityId(activityId: number): Promise<Comment[]> {
  try {
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

    return comments;
  } catch (error) {
    console.error('Errore fetch commenti:', error);
    return [];
  }
}