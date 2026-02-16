// Importa la libreria better-sqlite3 per interagire con il database SQLite
import Database from "better-sqlite3";
// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";
// Importa il modulo 'path' di Node.js per costruire percorsi di file cross-platform
import path from "path";

// Crea un'istanza del database SQLite con il percorso al file database.db
const db = new Database(path.join(process.cwd(), "app/data/database.db"));

/**
 * Handler GET per l'endpoint /api/profilo
 * Recupera i dati del profilo di un utente (logopedista o paziente) in base a email e ruolo.
 * I parametri vengono passati come query string: ?email=...&ruolo=...
 */
export async function GET(req: Request) {
  try {
    // Estrae i parametri dalla query string dell'URL della richiesta
    const { searchParams } = new URL(req.url);
    // Legge il parametro 'email' dalla query string
    const email = searchParams.get("email");
    // Legge il parametro 'ruolo' dalla query string ('logopedista' o 'paziente')
    const ruolo = searchParams.get("ruolo");

    // Validazione: verifica che entrambi i parametri siano presenti
    if (!email || !ruolo) {
      // Restituisce errore 400 (Bad Request) se mancano i parametri
      return NextResponse.json(
        { error: "Parametri mancanti" },
        { status: 400 }
      );
    }

    // Variabile per memorizzare i dati dell'utente trovato nel database
    let utente;

    // Se il ruolo è 'logopedista', cerca nella tabella Logopedista
    if (ruolo === "logopedista") {
      // Seleziona nome, cognome, dataNascita, numTelefono e email del logopedista con l'email specificata
      utente = db
        .prepare(
          "SELECT nome, cognome, dataNascita, numTelefono, email FROM Logopedista WHERE email = ?"
        )
        .get(email);
    }

    // Se il ruolo è 'paziente', cerca nella tabella Paziente
    if (ruolo === "paziente") {
      // Seleziona nome, cognome, dataNascita, numTelefono e email del paziente con l'email specificata
      utente = db
        .prepare(
          "SELECT nome, cognome, dataNascita, numTelefono, email FROM Paziente WHERE email = ?"
        )
        .get(email);
    }

    // Se nessun utente è stato trovato con quell'email, restituisce errore 404
    if (!utente) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Restituisce i dati dell'utente trovato, aggiungendo il campo 'ruolo' alla risposta JSON
    return NextResponse.json({
      ...utente,   // Tutti i campi dell'utente (nome, cognome, dataNascita, numTelefono, email)
      ruolo,       // Aggiunge il ruolo ('logopedista' o 'paziente') alla risposta
    });
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore API profilo:", error);
    // Restituisce errore 500 (Internal Server Error) in caso di eccezione
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

/**
 * Handler PUT per l'endpoint /api/profilo
 * Aggiorna i dati del profilo di un utente (logopedista o paziente).
 * Riceve nel body JSON i nuovi dati e l'email originale per identificare il record da aggiornare.
 */
export async function PUT(req: Request) {
  try {
    // Legge il corpo della richiesta come oggetto JSON
    const body = await req.json();

    // Destruttura i campi dal body della richiesta
    const {
      ruolo,             // Ruolo dell'utente: 'logopedista' o 'paziente'
      nome,              // Nuovo nome
      cognome,           // Nuovo cognome
      dataNascita,       // Nuova data di nascita
      numTelefono,       // Nuovo numero di telefono
      email,             // Nuova email
      emailOriginale,    // Email attuale usata come chiave per trovare il record da aggiornare
    } = body;

    // Validazione: verifica che emailOriginale e ruolo siano presenti
    if (!emailOriginale || !ruolo) {
      // Restituisce errore 400 (Bad Request) se mancano i dati essenziali
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    // Se il ruolo è 'logopedista', aggiorna il record nella tabella Logopedista
    if (ruolo === "logopedista") {
      // Aggiorna nome, cognome, dataNascita, numTelefono e email del logopedista
      // identificato dall'emailOriginale
      db.prepare(`
        UPDATE Logopedista
        SET nome = ?, cognome = ?, dataNascita = ?, numTelefono = ?, email = ?
        WHERE email = ?
      `).run(
        nome,              // Nuovo nome
        cognome,           // Nuovo cognome
        dataNascita,       // Nuova data di nascita
        numTelefono,       // Nuovo numero di telefono
        email,             // Nuova email
        emailOriginale     // Email attuale per identificare il record (clausola WHERE)
      );
    }

    // Se il ruolo è 'paziente', aggiorna il record nella tabella Paziente
    if (ruolo === "paziente") {
      // Aggiorna nome, cognome, dataNascita, numTelefono e email del paziente
      // identificato dall'emailOriginale
      db.prepare(`
        UPDATE Paziente
        SET nome = ?, cognome = ?, dataNascita = ?, numTelefono = ?, email = ?
        WHERE email = ?
      `).run(
        nome,              // Nuovo nome
        cognome,           // Nuovo cognome
        dataNascita,       // Nuova data di nascita
        numTelefono,       // Nuovo numero di telefono
        email,             // Nuova email
        emailOriginale     // Email attuale per identificare il record (clausola WHERE)
      );
    }

    // Restituisce successo dopo l'aggiornamento
    return NextResponse.json({ success: true });
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore aggiornamento profilo:", error);
    // Restituisce errore 500 (Internal Server Error) in caso di eccezione
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

