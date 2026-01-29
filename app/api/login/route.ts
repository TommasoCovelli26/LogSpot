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

    // Controllo logopedista
    const logopedista = db
      .prepare(
        "SELECT * FROM Logopedista WHERE email = ? AND password = ?"
      )
      .get(email, password);

    if (logopedista) {
      return NextResponse.json({
        ruolo: "logopedista",
        utente: {
          nome: logopedista.nome,
          cognome: logopedista.cognome,
          email: logopedista.email,
        },
      });
    }

    // Controllo paziente
    const paziente = db
      .prepare(
        "SELECT * FROM Paziente WHERE email = ? AND password = ?"
      )
      .get(email, password);

    if (paziente) {
      return NextResponse.json({
        ruolo: "paziente",
        utente: {
          nome: paziente.nome,
          cognome: paziente.cognome,
          email: paziente.email,
        },
      });
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
