import Database from "better-sqlite3";
import { NextResponse } from "next/server";
import path from "path";

const db = new Database(path.join(process.cwd(), "app/data/database.db"));

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const ruolo = searchParams.get("ruolo");

    if (!email || !ruolo) {
      return NextResponse.json(
        { error: "Parametri mancanti" },
        { status: 400 }
      );
    }

    let utente;

    if (ruolo === "logopedista") {
      utente = db
        .prepare(
          "SELECT nome, cognome, dataNascita, numTelefono, email FROM Logopedista WHERE email = ?"
        )
        .get(email);
    }

    if (ruolo === "paziente") {
      utente = db
        .prepare(
          "SELECT nome, cognome, dataNascita, numTelefono, email FROM Paziente WHERE email = ?"
        )
        .get(email);
    }

    if (!utente) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    // ✅ aggiungiamo il ruolo direttamente qui
    return NextResponse.json({
      ...utente,
      ruolo,
    });
  } catch (error) {
    console.error("Errore API profilo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      ruolo,
      nome,
      cognome,
      dataNascita,
      numTelefono,
      email,
      emailOriginale,
    } = body;

    if (!emailOriginale || !ruolo) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    if (ruolo === "logopedista") {
      db.prepare(`
        UPDATE Logopedista
        SET nome = ?, cognome = ?, dataNascita = ?, numTelefono = ?, email = ?
        WHERE email = ?
      `).run(
        nome,
        cognome,
        dataNascita,
        numTelefono,
        email,
        emailOriginale
      );
    }

    if (ruolo === "paziente") {
      db.prepare(`
        UPDATE Paziente
        SET nome = ?, cognome = ?, dataNascita = ?, numTelefono = ?, email = ?
        WHERE email = ?
      `).run(
        nome,
        cognome,
        dataNascita,
        numTelefono,
        email,
        emailOriginale
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore aggiornamento profilo:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

