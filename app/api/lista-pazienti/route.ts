// app/api/pazienti/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("q") ?? "";
  const pIva = searchParams.get("pIva"); // logopedista loggato

  if (!pIva) {
    return NextResponse.json({ error: "Logopedista non autenticato" }, { status: 401 });
  }

  const stmt = db.prepare(`
    SELECT cf, nome, cognome, email, numTelefono
    FROM Paziente
    WHERE id_logopedista = ?
      AND (nome LIKE ? OR cognome LIKE ?)
  `);

  const pazienti = stmt.all(
    pIva,
    `%${query}%`,
    `%${query}%`
  );

  return NextResponse.json(pazienti);
}
