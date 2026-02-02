"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div style={styles.field}>
        <strong>{label}</strong>

        {!edit ? (
        <span style={styles.value}>
            {utente[name] || "-"}
        </span>
        ) : (
        <input
            name={name}
            value={utente[name] || ""}
            onChange={handleChange}
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


  if (!utente) return <p>Caricamento...</p>;

  return (
    <div style={styles.container}>
      <h2>{utente.nome} {utente.cognome}</h2>
      <span style={styles.role}>{utente.ruolo}</span>

      <div style={styles.card}>
        {campo("Nome", "nome")}
        {campo("Cognome", "cognome")}
        {campo("Data di nascita", "dataNascita")}
        {campo("Telefono", "numTelefono")}
        {campo("Email", "email")}
      </div>

      {!edit ? (
        <button onClick={avviaModifica} style={styles.editBtn}>
          ✏️ Modifica
        </button>
      ) : (
        <button onClick={annullaModifiche} style={styles.editBtn}>
          ✖️ Annulla
        </button>
      )}

      {edit && (
        <button onClick={salvaModifiche} style={styles.saveBtn}>
          💾 Salva modifiche
        </button>
      )}

      <button onClick={eliminaAccount} style={styles.deleteBtn}>
        🗑️ Elimina account
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "450px",
    margin: "40px auto",
    padding: "1.5rem",
  },
  card: {
    display: "grid",
    gap: "1rem",
    marginTop: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
  },
  role: {
    background: "#2563eb",
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
  },
  editBtn: {
    marginTop: "15px",
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
  },
  saveBtn: {
    marginTop: "10px",
    padding: "10px",
    background: "green",
    color: "white",
    border: "none",
  },
  deleteBtn: {
    marginTop: "20px",
    padding: "10px",
    background: "red",
    color: "white",
    border: "none",
  },
  value: {
    padding: "8px 4px",
    color: "#333",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
  },
};
