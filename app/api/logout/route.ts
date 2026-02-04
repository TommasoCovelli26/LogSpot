import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Cancelliamo il cookie impostando una scadenza nel passato
  response.cookies.set("utente", "", { 
    path: "/", 
    expires: new Date(0) 
  });

  return response;
}