import Link from "next/link";

type NextExerciseCardProps = {
  exercise?: { id: number; titolo?: string; dataAssegnazione?: string };
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

export default function NextExerciseCard({
  exercise,
}: NextExerciseCardProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
            Prossimo esercizio da fare
          </p>
          {exercise ? (
            <>
              <p className="text-lg font-semibold text-blue-900 mt-2">
                {exercise.titolo || "Esercizio senza titolo"}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Assegnato il {formatLocalDate(exercise.dataAssegnazione)}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-2">
              Non ci sono esercizi in corso. Ottimo lavoro!
            </p>
          )}
        </div>
        {exercise && (
          <Link
            href={`/paziente/esercizi/${exercise.id}`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Inizia ora
          </Link>
        )}
      </div>
    </div>
  );
}
