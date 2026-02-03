import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

// Percorso database
const dbPath = path.join(process.cwd(), "app/data/database.db");

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e password obbligatorie" },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // --- Controllo LOGOPEDISTA ---
    const logopedista = db
      .prepare("SELECT * FROM Logopedista WHERE email = ? AND password = ?")
      .get(email, password) as any;

    if (logopedista) {
      const userData = {
        ruolo: "logopedista",
        utente: {
          nome: logopedista.nome,
          cognome: logopedista.cognome,
          email: logopedista.email,
          pIva: logopedista.pIva, // La chiave che useremo
        },
      };

      // Creiamo la risposta
      const response = NextResponse.json(userData);

      // AGGIUNTA: Impostiamo il Cookie "utente"
      // HttpOnly = true significa che il JavaScript del browser non può leggerlo (più sicuro)
      response.cookies.set("utente", JSON.stringify(userData), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 settimana
      });

      return response;
    }

    // --- Controllo PAZIENTE ---
    const paziente = db
      .prepare("SELECT * FROM Paziente WHERE email = ? AND password = ?")
      .get(email, password) as any;

    if (paziente) {
      const userData = {
        ruolo: "paziente",
        utente: {
          nome: paziente.nome,
          cognome: paziente.cognome,
          email: paziente.email,
          cf: paziente.cf,
        },
      };

      const response = NextResponse.json(userData);

      // AGGIUNTA: Cookie anche per il paziente (per coerenza futura)
      response.cookies.set("utente", JSON.stringify(userData), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json(
      { error: "Credenziali non valide" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Errore login:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}