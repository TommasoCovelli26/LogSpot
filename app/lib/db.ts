import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'app', 'data', 'database.db');

export const db = new Database(dbPath, { readonly: false, fileMustExist: true });

export default db;
