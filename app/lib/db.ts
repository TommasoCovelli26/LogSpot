// Importa la libreria better-sqlite3, un wrapper sincrono ad alte prestazioni per SQLite in Node.js
import Database from 'better-sqlite3';
// Importa il modulo 'path' di Node.js per gestire e costruire percorsi di file in modo cross-platform
import path from 'path';

// Costruisce il percorso assoluto al file del database SQLite, partendo dalla directory corrente del progetto
// Il file database.db si trova nella cartella app/data/
const dbPath = path.join(process.cwd(), 'app', 'data', 'database.db');

// Crea e esporta l'istanza del database SQLite con le seguenti opzioni:
// - readonly: false → permette operazioni di lettura e scrittura
// - fileMustExist: true → lancia un errore se il file del database non esiste
export const db = new Database(dbPath, { readonly: false, fileMustExist: true });

// Esporta l'istanza del database anche come export di default per consentire import alternativi
export default db;
