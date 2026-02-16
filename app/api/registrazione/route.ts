// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";
// Importa la libreria better-sqlite3 per interagire con il database SQLite
import Database from "better-sqlite3";
// Importa il modulo 'path' di Node.js per costruire percorsi di file cross-platform
import path from "path";

// Costruisce il percorso assoluto al file del database SQLite
const dbPath = path.join(process.cwd(), "app/data/database.db");

/**
 * Handler POST per l'endpoint /api/registrazione
 * Gestisce la registrazione di nuovi utenti (logopedisti e pazienti).
 * Verifica che tutti i campi siano compilati e che l'email non sia già in uso.
 */
export async function POST(req: Request) {
  try {
    // Estrae tutti i campi dal corpo della richiesta JSON
    const {
      ruolo,         // Ruolo dell'utente: 'logopedista' o 'paziente'
      nome,          // Nome dell'utente
      cognome,       // Cognome dell'utente
      dataNascita,   // Data di nascita dell'utente
      numTelefono,   // Numero di telefono dell'utente
      email,         // Indirizzo email dell'utente
      password,      // Password scelta dall'utente
      codice,        // Codice identificativo: P.IVA per logopedista, CF per paziente
    } = await req.json();

    // Validazione: verifica che tutti i campi obbligatori siano presenti
    if (
      !ruolo ||
      !nome ||
      !cognome ||
      !dataNascita ||
      !numTelefono ||
      !email ||
      !password ||
      !codice
    ) {
      // Restituisce errore 400 (Bad Request) se manca almeno un campo
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    // Apre una connessione al database SQLite
    const db = new Database(dbPath);

    // Controlla se l'email è già registrata nella tabella Logopedista o Paziente
    const existingUser =
      db.prepare("SELECT email FROM Logopedista WHERE email = ?").get(email) ||
      db.prepare("SELECT email FROM Paziente WHERE email = ?").get(email);

    // Se l'email è già in uso, restituisce errore 409 (Conflict)
    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      );
    }

    // Se il ruolo è 'logopedista', inserisce un nuovo record nella tabella Logopedista
    if (ruolo === "logopedista") {
      db.prepare(
        `
        INSERT INTO Logopedista
        (pIva, nome, cognome, dataNascita, numTelefono, email, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        codice,        // P.IVA del logopedista (usata come chiave primaria)
        nome,          // Nome del logopedista
        cognome,       // Cognome del logopedista
        dataNascita,   // Data di nascita
        numTelefono,   // Numero di telefono
        email,         // Email univoca
        password       // Password dell'account
      );
    } else if (ruolo === "paziente") {
      // Se il ruolo è 'paziente', inserisce un nuovo record nella tabella Paziente
      db.prepare(
        `
        INSERT INTO Paziente
        (cf, nome, cognome, dataNascita, numTelefono, email, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        codice,        // Codice fiscale del paziente (usato come chiave primaria)
        nome,          // Nome del paziente
        cognome,       // Cognome del paziente
        dataNascita,   // Data di nascita
        numTelefono,   // Numero di telefono
        email,         // Email univoca
        password       // Password dell'account
      );
    } else {
      // Se il ruolo non è né 'logopedista' né 'paziente', restituisce errore 400
      return NextResponse.json(
        { error: "Ruolo non valido" },
        { status: 400 }
      );
    }

    // Se tutto è andato a buon fine, restituisce un messaggio di successo
    return NextResponse.json({ message: "Registrazione avvenuta con successo" });
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore registrazione:", error);
    // Restituisce errore 500 (Internal Server Error) in caso di eccezione
    return NextResponse.json(
      { error: "Errore del server" },
      { status: 500 }
    );
  }
}
