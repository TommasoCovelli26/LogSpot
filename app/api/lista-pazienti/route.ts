// Commento legacy: identificava il file come app/api/pazienti/route.ts (percorso precedente)
// app/api/pazienti/route.ts
// Importa NextResponse da Next.js per costruire risposte HTTP nelle API route
import { NextResponse } from "next/server";
// Importa l'istanza del database SQLite dal modulo db locale
import { db } from "@/lib/db";

/**
 * Handler GET per l'endpoint /api/lista-pazienti
 * Recupera la lista dei pazienti associati a un logopedista, con supporto per ricerca testuale.
 * Parametri query string:
 * - pIva: P.IVA del logopedista (obbligatorio)
 * - q: termine di ricerca su nome e cognome del paziente (opzionale, default: stringa vuota)
 */
export async function GET(req: Request) {
  // Estrae i parametri dalla query string dell'URL
  const { searchParams } = new URL(req.url);

  // Legge il termine di ricerca dalla query string (default: stringa vuota)
  const query = searchParams.get("q") ?? "";
  // Legge la P.IVA del logopedista dalla query string
  const pIva = searchParams.get("pIva"); // logopedista loggato

  // Validazione: verifica che la P.IVA sia presente
  if (!pIva) {
    // Restituisce errore 401 se il logopedista non è autenticato
    return NextResponse.json({ error: "Logopedista non autenticato" }, { status: 401 });
  }

  // Prepara la query SQL: seleziona i dati dei pazienti associati al logopedista
  // Filtra per id_logopedista e applica ricerca LIKE su nome e cognome
  const stmt = db.prepare(`
    SELECT cf, nome, cognome, email, numTelefono
    FROM Paziente
    WHERE id_logopedista = ?
      AND (nome LIKE ? OR cognome LIKE ?)
  `);

  // Esegue la query con la P.IVA del logopedista e il termine di ricerca con wildcard
  const pazienti = stmt.all(
    pIva,
    `%${query}%`,
    `%${query}%`
  );

  // Restituisce l'array dei pazienti come risposta JSON
  return NextResponse.json(pazienti);
}
