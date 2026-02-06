import Link from "next/link";

type RecentExercisesProps = {
  exercises: {
    id: number;
    titolo?: string;
    dataAssegnazione?: string;
    statoCompletamento?: string | null;
    patientName: string;
    patientCf: string;
  }[];
  isLoading: boolean;
};

function formatLocalDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentExercises({
  exercises,
  isLoading,
}: RecentExercisesProps) {
  const recentExercises = [...exercises]
    .sort(
      (a, b) =>
        new Date(b.dataAssegnazione || 0).getTime() -
        new Date(a.dataAssegnazione || 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-900">
          Ultimi esercizi assegnati
        </h2>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          Ultimi 5
        </span>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-600">Caricamento esercizi...</p>
      ) : recentExercises.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nessun esercizio assegnato di recente.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span className="col-span-4">Titolo</span>
            <span className="col-span-3">Paziente</span>
            <span className="col-span-3">Data</span>
            <span className="col-span-2 text-right">Stato</span>
          </div>
          <div className="divide-y divide-gray-100">
            {recentExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="grid grid-cols-12 items-center py-3 text-sm"
              >
                <span className="col-span-4 font-semibold text-gray-900">
                  {exercise.titolo || "Esercizio senza titolo"}
                </span>
                <Link
                  href={`/logopedista/lista-pazienti/dettaglio-paziente/${exercise.patientCf}`}
                  className="col-span-3 text-blue-600 hover:text-blue-700"
                >
                  {exercise.patientName}
                </Link>
                <span className="col-span-3 text-gray-600">
                  {formatLocalDate(exercise.dataAssegnazione)}
                </span>
                <span className="col-span-2 text-right text-gray-700">
                  {exercise.statoCompletamento || "da-svolgere"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
