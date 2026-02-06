"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatsOverview from "@/ui/logopedista/stats-overview";
import PatientsToFollow from "@/ui/logopedista/patients-to-follow";
import RecentExercises from "@/ui/logopedista/recent-exercises";
import DashboardStats from "@/ui/paziente/dashboard-stats";
import CompletionProgress from "@/ui/paziente/completion-progress";
import NextExerciseCard from "@/ui/paziente/next-exercise-card";

export default function DashboardPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [logopedistaStats, setLogopedistaStats] = useState({
    patients: 0,
    assigned: 0,
    completedToday: 0,
    inProgress: 0,
  });
  const [patientsToFollow, setPatientsToFollow] = useState<
    { cf: string; nome: string; cognome: string; pending: number }[]
  >([]);
  const [latestExercises, setLatestExercises] = useState<
    {
      id: number;
      titolo?: string;
      dataAssegnazione?: string;
      statoCompletamento?: string | null;
      patientName: string;
      patientCf: string;
    }[]
  >([]);
  const [isLoadingLogopedistaStats, setIsLoadingLogopedistaStats] =
    useState(false);

  useEffect(() => {
    const u = localStorage.getItem("utente");
    if (!u) {
      router.push("/login");
      return;
    }
    setUtente(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (!utente || utente.ruolo !== "paziente") return;

    const loadExercises = async () => {
      setIsLoadingExercises(true);
      try {
        const res = await fetch(`/api/progressi?cf=${utente.codice}`);
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
        }
      } catch (error) {
        console.error("Errore nel caricamento degli esercizi", error);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    loadExercises();
  }, [utente]);

  useEffect(() => {
    if (!utente || utente.ruolo !== "logopedista") return;

    const loadLogopedistaStats = async () => {
      setIsLoadingLogopedistaStats(true);
      try {
        const patientsRes = await fetch(
          `/api/lista-pazienti?pIva=${utente.codice}`
        );
        if (!patientsRes.ok) return;

        const patients = await patientsRes.json();
        const patientList = Array.isArray(patients) ? patients : [];
        const exercisesResponses = await Promise.all(
          patientList.map((patient) =>
            fetch(`/api/esercizi?cf=${patient.cf}&pIva=${utente.codice}`)
          )
        );

        const exercisesPayloads = await Promise.all(
          exercisesResponses.map((res) => (res.ok ? res.json() : []))
        );
        const patientsWithPending = patientList
          .map((patient, index) => {
            const patientExercises = Array.isArray(exercisesPayloads[index])
              ? exercisesPayloads[index]
              : [];
            const pending = patientExercises.filter(
              (exercise) => exercise.statoCompletamento !== "completato"
            ).length;
            return { ...patient, pending };
          })
          .filter((patient) => patient.pending > 0);
        const exercisesWithPatient = patientList.flatMap((patient, index) => {
          const patientExercises = Array.isArray(exercisesPayloads[index])
            ? exercisesPayloads[index]
            : [];
          return patientExercises.map((exercise) => ({
            id: exercise.id,
            titolo: exercise.titolo,
            dataAssegnazione: exercise.dataAssegnazione,
            statoCompletamento: exercise.statoCompletamento,
            patientName: `${patient.nome} ${patient.cognome}`,
            patientCf: patient.cf,
          }));
        });
        const allExercises = exercisesPayloads.flat();
        const completedToday = allExercises.filter(
          (exercise) =>
            exercise.statoCompletamento === "completato" &&
            isSameDay(exercise.dataAssegnazione)
        ).length;
        const inProgress = allExercises.filter(
          (exercise) =>
            !exercise.statoCompletamento ||
            exercise.statoCompletamento === "in-corso"
        ).length;

        setLogopedistaStats({
          patients: patientList.length,
          assigned: allExercises.length,
          completedToday,
          inProgress,
        });
        setPatientsToFollow(patientsWithPending);
        setLatestExercises(exercisesWithPatient);
      } catch (error) {
        console.error("Errore nel caricamento dei dati logopedista", error);
      } finally {
        setIsLoadingLogopedistaStats(false);
      }
    };

    loadLogopedistaStats();
  }, [utente]);

  if (!utente) return null;

  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(
    (ex) => ex.statoCompletamento === "completato"
  ).length;
  const inProgressExercises = exercises.filter(
    (ex) => !ex.statoCompletamento || ex.statoCompletamento === "in-corso"
  ).length;
  const nextExercise = exercises.find(
    (ex) => !ex.statoCompletamento || ex.statoCompletamento === "in-corso"
  );
  const completionRate = totalExercises
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;
  let motivationalMessage = "";

  if (completionRate === 0) {
    motivationalMessage =
      "Si parte da qui: ogni esercizio conta. Inizia con calma e costanza.";
  } else if (completionRate < 100) {
    motivationalMessage =
      "Ottimo lavoro, continua cosi: stai avanzando nel tuo percorso.";
  } else {
    motivationalMessage =
      "Complimenti, hai completato tutti gli esercizi!";
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* INTRODUZIONE */}
      <h1 className="text-3xl font-bold mb-2">
        Benvenuto 👋
      </h1>

      <p className="text-gray-600 mb-8">
        {utente.ruolo === "logopedista"
          ? "Da qui puoi gestire i tuoi pazienti, creare attività e monitorare i progressi."
          : "Da qui puoi svolgere i tuoi esercizi e seguire il tuo percorso riabilitativo."}
      </p>

      {/* DASHBOARD LOGOPEDISTA */}
      {utente.ruolo === "logopedista" && (
        <div>
          <StatsOverview
            patients={logopedistaStats.patients}
            assigned={logopedistaStats.assigned}
            completedToday={logopedistaStats.completedToday}
            inProgress={logopedistaStats.inProgress}
            isLoading={isLoadingLogopedistaStats}
          />
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              title="Pazienti"
              description="Consulta e gestisci in modo ordinato l'elenco dei tuoi pazienti."
              summary="Accedi alle schede cliniche, aggiorna le informazioni e verifica lo stato delle assegnazioni in corso."
              href="/logopedista/lista-pazienti"
            />
            <Card
              title="Le mie attività"
              description="Crea e organizza attività riabilitative con criteri coerenti."
              summary="Gestisci i materiali disponibili, aggiorna i contenuti e riutilizza le attività con migliori risultati."
              href="/logopedista/imieimateriali"
            />
            <Card
              title="Ricerca Attività"
              description="Esplora attività riabilitative della community in modo mirato."
              summary="Applica filtri per obiettivi e patologie, valuta le proposte e salva ciò che è più pertinente."
              href="/logopedista/esercizi"
            />
          </div>
          <div className="mt-8">
            <PatientsToFollow
              patients={patientsToFollow}
              isLoading={isLoadingLogopedistaStats}
            />
          </div>
          <div className="mt-6">
            <RecentExercises
              exercises={latestExercises}
              isLoading={isLoadingLogopedistaStats}
            />
          </div>
        </div>
      )}

      {/* DASHBOARD PAZIENTE */}
      {utente.ruolo === "paziente" && (
        <div>
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <Card
              title="I miei esercizi"
              description="Svolgi gli esercizi assegnati dal tuo logopedista."
              summary="Ritrova l'elenco aggiornato delle attività, verifica le priorità e riprendi da dove eri arrivato."
              href="/paziente/esercizi"
            />
            <Card
              title="Progressi"
              description="Monitora i tuoi miglioramenti con una visione chiara."
              summary="Consulta i risultati recenti, osserva l'andamento del percorso e identifica i punti di forza."
              href="/paziente/progressi"
            />
            <Card
              title="Profilo"
              description="Visualizza e modifica i tuoi dati personali in sicurezza."
              summary="Aggiorna i recapiti, verifica le preferenze e mantieni il tuo profilo sempre allineato."
              href="/profilo"
            />
          </div>
          <DashboardStats
            total={totalExercises}
            completed={completedExercises}
            inProgress={inProgressExercises}
            isLoading={isLoadingExercises}
          />
          <CompletionProgress
            percentage={completionRate}
            isLoading={isLoadingExercises}
            message={motivationalMessage}
          />
          <div className="mb-8">
            <NextExerciseCard exercise={nextExercise} />
          </div>
        </div>
      )}
    </div>
  );
}

/* CARD RIUTILIZZABILE */
function Card({
  title,
  description,
  summary,
  href,
}: {
  title: string;
  description: string;
  summary: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition"
    >
      <h3 className="text-xl font-semibold mb-2 text-blue-600">
        {title}
      </h3>
      <p className="text-gray-700 text-sm mb-3">{description}</p>
      <p className="text-gray-600 text-xs leading-relaxed">
        {summary}
      </p>
    </Link>
  );
}

function isSameDay(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}


