"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="p-6 max-w-6xl mx-auto">
      {/* INTRODUZIONE */}
      <h1 className="text-3xl font-bold mb-2">
        Benvenuto, {utente.nome} 👋
      </h1>

      <p className="text-gray-600 mb-8">
        {utente.ruolo === "logopedista"
          ? "Da qui puoi gestire i tuoi pazienti, creare attività e monitorare i progressi."
          : "Da qui puoi svolgere i tuoi esercizi e seguire il tuo percorso riabilitativo."}
      </p>

      {/* DASHBOARD LOGOPEDISTA */}
      {utente.ruolo === "logopedista" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            title="Pazienti"
            description="Visualizza e gestisci i tuoi pazienti."
            href="/logopedista/lista-pazienti"
          />
          <Card
            title="Attività"
            description="Crea e organizza attività riabilitative."
            href="/logopedista/imieimateriali"
          />
          <Card
            title="Esercizi"
            description="Assegna esercizi e controlla i risultati."
            href="/logopedista/esercizi"
          />
        </div>
      )}

      {/* DASHBOARD PAZIENTE */}
      {utente.ruolo === "paziente" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            title="I miei esercizi"
            description="Svolgi gli esercizi assegnati dal logopedista."
            href="/dashboard/esercizi"
          />
          <Card
            title="Progressi"
            description="Monitora i tuoi miglioramenti nel tempo."
            href="/dashboard/progressi"
          />
          <Card
            title="Profilo"
            description="Visualizza e modifica i tuoi dati personali."
            href="/profilo"
          />
        </div>
      )}
    </div>
  );
}

/* CARD RIUTILIZZABILE */
function Card({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition"
    >
      <h3 className="text-xl font-semibold mb-2 text-blue-600">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

