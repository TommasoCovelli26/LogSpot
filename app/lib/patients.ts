'use server';

import { db } from '@/lib/db';

export interface Patient {
  cf: string;
  nome: string;
  cognome: string;
  email: string;
  numTelefono: string | null;
  dataNascita: string | null;
}

export async function fetchPatients(pIva: string, query?: string): Promise<Patient[]> {
  try {
    let sql = `
      SELECT cf, nome, cognome, email, numTelefono, dataNascita
      FROM Paziente
      WHERE id_logopedista = ?
    `;
    const params: any[] = [pIva];

    if (query && query.trim()) {
      sql += ` AND (nome LIKE ? OR cognome LIKE ?)`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ` ORDER BY cognome ASC, nome ASC`;

    const stmt = db.prepare(sql);
    const patients = stmt.all(...params) as Patient[];
    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

export async function fetchPatientsByCf(cf: string): Promise<Patient | null> {
  try {
    const stmt = db.prepare(`
      SELECT cf, nome, cognome, email, numTelefono, dataNascita
      FROM Paziente
      WHERE cf = ?
    `);
    const patient = stmt.get(cf) as Patient | undefined;
    return patient || null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
}
