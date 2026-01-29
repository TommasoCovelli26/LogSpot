import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "app/data/database.db");

export async function POST(req: Request) {
  try {
    const {
      ruolo,
      nome,
      cognome,
      dataNascita,
      numTelefono,
      email,
      password,
      codice,
    } = await req.json();

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
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori" },
        { status: 400 }
      );
    }

    const db = new Database(dbPath);

    // Controllo email già esistente
    const existingUser =
      db.prepare("SELECT email FROM Logopedista WHERE email = ?").get(email) ||
      db.prepare("SELECT email FROM Paziente WHERE email = ?").get(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 409 }
      );
    }

    if (ruolo === "logopedista") {
      db.prepare(
        `
        INSERT INTO Logopedista
        (pIva, nome, cognome, dataNascita, numTelefono, email, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        codice,
        nome,
        cognome,
        dataNascita,
        numTelefono,
        email,
        password
      );
    } else if (ruolo === "paziente") {
      db.prepare(
        `
        INSERT INTO Paziente
        (cf, nome, cognome, dataNascita, numTelefono, email, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      ).run(
        codice,
        nome,
        cognome,
        dataNascita,
        numTelefono,
        email,
        password
      );
    } else {
      return NextResponse.json(
        { error: "Ruolo non valido" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Registrazione avvenuta con successo" });
  } catch (error) {
    console.error("Errore registrazione:", error);
    return NextResponse.json(
      { error: "Errore del server" },
      { status: 500 }
    );
  }
}
