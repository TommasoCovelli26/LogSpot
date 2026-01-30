import Database from "better-sqlite3";
import { NextResponse } from "next/server";
import path from "path";

const db = new Database(path.join(process.cwd(), "app/data/database.db"));

export async function DELETE(req: Request) {
  try {
    const { email, ruolo } = await req.json();

    if (!email || !ruolo) {
      return NextResponse.json(
        { error: "Dati mancanti" },
        { status: 400 }
      );
    }

    let result;

    if (ruolo === "logopedista") {
      result = db
        .prepare("DELETE FROM Logopedista WHERE email = ?")
        .run(email);
    }

    if (ruolo === "paziente") {
      result = db
        .prepare("DELETE FROM Paziente WHERE email = ?")
        .run(email);
    }

    if (!result || result.changes === 0) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione account:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
