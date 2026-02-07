"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { lusitana } from "@/ui/fonts";

export default function ProfiloPage() {
  const router = useRouter();

  const [utente, setUtente] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [utenteOriginale, setUtenteOriginale] = useState<any>(null);

 useEffect(() => {
  const sessione = localStorage.getItem("utente");
  if (!sessione) {
    router.push("/login");
    return;
  }

  const { email, ruolo } = JSON.parse(sessione);

  const caricaProfilo = async () => {
    try {
      const res = await fetch(
        `/api/profilo?email=${encodeURIComponent(email)}&ruolo=${ruolo}`
      );

      if (!res.ok) {
        throw new Error("Errore risposta server");
      }

      const data = await res.json();
      setUtente({
        ...data,
        ruolo,
        emailOriginale: data.email,
      });
    } catch (err) {
      console.error("Errore caricamento profilo:", err);
      alert("Errore nel caricamento del profilo");
      router.push("/");
    }
  };

  caricaProfilo();
  }, []);




  // ✅ DEVE STARE QUI
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUtente({ ...utente, [e.target.name]: e.target.value });
  };

  // ✅ DEVE STARE QUI
  const campo = (label: string, name: string) => (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-gray-600">{label}</span>

      {!edit ? (
        <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800">
          {utente[name] || "-"}
        </span>
      ) : (
        <input
          name={name}
          value={utente[name] || ""}
          onChange={handleChange}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      )}
    </div>
  );


  const salvaModifiche = async () => {
    const res = await fetch("/api/profilo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        ...utente,
        emailOriginale: utente.emailOriginale,
        ruolo: utente.ruolo,
        }),
    });

    if (res.ok) {
        alert("Profilo aggiornato!");
        setEdit(false);
    } else {
        alert("Errore nel salvataggio");
    }
  };

  const avviaModifica = () => {
    setUtenteOriginale(utente);
    setEdit(true);
  };

  const annullaModifiche = () => {
    const conferma = window.confirm("Sei sicuro di annullare le modifiche?");
    if (!conferma) return;
    if (utenteOriginale) {
      setUtente(utenteOriginale);
    }
    setEdit(false);
  };


  const eliminaAccount = async () => {
    if (!utente) return;

    const conferma = confirm("Sei sicuro di voler eliminare l’account?");
    if (!conferma) return;

    await fetch("/api/elimina-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        email: utente.email,
        ruolo: utente.ruolo,
        }),
    });

    localStorage.removeItem("utente");
    router.push("/login");
  };


  if (!utente) return <p className="text-center py-10 text-gray-500">Caricamento...</p>;

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className={`${lusitana.className} text-3xl md:text-4xl text-blue-600 font-bold`}>
              Profilo
            </h1>
            <p className="text-gray-500 mt-2">
              Gestisci i tuoi dati personali e aggiorna le informazioni di contatto.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
              {utente.nome?.[0]}
              {utente.cognome?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {utente.nome} {utente.cognome}
              </h2>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                {utente.ruolo}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            {campo("Nome", "nome")}
            {campo("Cognome", "cognome")}
            {campo("Data di nascita", "dataNascita")}
            {campo("Telefono", "numTelefono")}
            <div className="md:col-span-2">{campo("Email", "email")}</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {!edit ? (
            <button
              onClick={avviaModifica}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-blue-700"
            >
              ✏️ Modifica
            </button>
          ) : (
            <button
              onClick={annullaModifiche}
              className="inline-flex items-center justify-center rounded-full bg-gray-200 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-700 shadow-sm transition hover:bg-gray-300"
            >
              ✖️ Annulla
            </button>
          )}

          {edit && (
            <button
              onClick={salvaModifiche}
              className="inline-flex items-center justify-center rounded-full bg-green-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-green-600"
            >
              💾 Salva modifiche
            </button>
          )}

          <button
            onClick={eliminaAccount}
            className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-red-600"
          >
            🗑️ Elimina account
          </button>
        </div>
      </div>
    </main>
  );
}
