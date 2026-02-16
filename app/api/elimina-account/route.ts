// Importa la libreria better-sqlite3 per interagire con il database SQLite
import Database from "better-sqlite3";
// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";
// Importa il modulo 'path' di Node.js per costruire percorsi di file cross-platform
import path from "path";

// Crea un'istanza del database SQLite con il percorso al file database.db
const db = new Database(path.join(process.cwd(), "app/data/database.db"));

/**
 * Handler DELETE per l'endpoint /api/elimina-account
 * Elimina definitivamente l'account di un utente dal database.
 * Riceve nel body JSON l'email e il ruolo dell'utente da eliminare.
 * L'eliminazione è irreversibile e, grazie ai vincoli ON DELETE CASCADE nello schema,
 * rimuove automaticamente anche tutti i dati associati (attività, esercizi, commenti, ecc.).
 */
export async function DELETE(req: Request) {
  try {
    // Estrae email e ruolo dal corpo della richiesta JSON
    const { email, ruolo } = await req.json();

    // Validazione: verifica che email e ruolo siano presenti
    if (!email || !ruolo) {
      // Restituisce errore 400 (Bad Request) se mancano i dati obbligatori
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    // Variabile per memorizzare il risultato dell'operazione DELETE
    let result;

    // Se il ruolo è 'logopedista', elimina il record dalla tabella Logopedista
    if (ruolo === "logopedista") {
      // Elimina il logopedista con l'email specificata
      result = db
        .prepare("DELETE FROM Logopedista WHERE email = ?")
        .run(email);
    }

    // Se il ruolo è 'paziente', elimina il record dalla tabella Paziente
    if (ruolo === "paziente") {
      // Elimina il paziente con l'email specificata
      result = db
        .prepare("DELETE FROM Paziente WHERE email = ?")
        .run(email);
    }

    // Verifica se l'eliminazione è avvenuta: se result è undefined o nessuna riga è stata modificata
    if (!result || result.changes === 0) {
      // Restituisce errore 404 (Not Found) se l'utente non è stato trovato nel database
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Restituisce successo se l'account è stato eliminato correttamente
    return NextResponse.json({ success: true });
  } catch (error) {
    // Logga l'errore nella console per il debug
    console.error("Errore eliminazione account:", error);
    // Restituisce errore 500 (Internal Server Error) in caso di eccezione
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
