"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegistrazionePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ruolo = searchParams.get("ruolo"); // logopedista | paziente

  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    dataNascita: "",
    numTelefono: "",
    email: "",
    password: "",
    codice: "",
  });

  useEffect(() => {
    if (!ruolo) {
      // se qualcuno arriva qui senza ruolo → torna alla home
      router.push("/");
    }
  }, [ruolo, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/registrazione", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ruolo,
        ...form,
      }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      alert("Errore durante la registrazione");
    }
  };

  if (!ruolo) return null;

  return (
    <div style={styles.container}>
      <h1>Registrazione {ruolo === "logopedista" ? "Logopedista" : "Paziente"}</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="nome" placeholder="Nome" onChange={handleChange} required style={styles.input} />
        <input name="cognome" placeholder="Cognome" onChange={handleChange} required style={styles.input} />
        <input type="date" name="dataNascita" onChange={handleChange} required style={styles.input} />
        <input name="numTelefono" placeholder="Numero di telefono" onChange={handleChange} required style={styles.input} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={styles.input} />

        {ruolo === "logopedista" && (
          <input
            name="codice"
            placeholder="Partita IVA"
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}

        {ruolo === "paziente" && (
          <input
            name="codice"
            placeholder="Codice Fiscale"
            onChange={handleChange}
            required
            style={styles.input}
          />
        )}

        <button type="submit" style={styles.button}>
          Registrati
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "450px",
    margin: "60px auto",
    padding: "2rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
