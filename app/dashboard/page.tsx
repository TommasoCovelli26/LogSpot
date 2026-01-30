"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("utente");
    if (!u) {
      router.push("/login");
      return;
    }
    setUtente(JSON.parse(u));
  }, []);

  if (!utente) return null;

  return (
    <div>
      <h1>Benvenuto, {utente.nome} 👋</h1>

      {utente.ruolo === "logopedista" && (
        <div>
          <h3>Area Logopedista</h3>
          <p>Gestisci i pazienti e crea nuove attività.</p>
        </div>
      )}

      {utente.ruolo === "paziente" && (
        <div>
          <h3>Area Paziente</h3>
          <p>Consulta i tuoi esercizi e i tuoi progressi.</p>
        </div>
      )}
    </div>
  );
}
