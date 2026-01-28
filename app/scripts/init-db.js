import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

console.log("🔄 Inizializzazione database LogSpot...");

// Percorsi
const dbPath = path.join(process.cwd(), "app/data/database.db");
const schemaPath = path.join(process.cwd(), "app/data/schema.sql");
const populatePath = path.join(process.cwd(), "app/data/populate.sql");

// Elimina DB se esiste
if (fs.existsSync(dbPath)) {
  console.log("🗑️  Database esistente trovato. Eliminazione...");
  fs.unlinkSync(dbPath);
}

// Crea DB
const db = new Database(dbPath);

// Legge SQL
const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
const populateSQL = fs.readFileSync(populatePath, "utf-8");

try {
  console.log("📐 Creazione tabelle...");
  db.exec(schemaSQL);

  console.log("📥 Inserimento dati...");
  db.exec(populateSQL);

  console.log("✅ Database creato e popolato correttamente!");
} catch (err) {
  console.error("❌ Errore:", err);
} finally {
  db.close();
}
