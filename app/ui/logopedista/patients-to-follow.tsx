import Link from "next/link";

type PatientsToFollowProps = {
  patients: { cf: string; nome: string; cognome: string; pending: number }[];
  isLoading: boolean;
};

export default function PatientsToFollow({
  patients,
  isLoading,
}: PatientsToFollowProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-900">
          Pazienti da seguire oggi
        </h2>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          In sospeso
        </span>
      </div>
      {isLoading ? (
        <p className="text-sm text-gray-600">Caricamento elenco...</p>
      ) : patients.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nessun paziente con esercizi in sospeso al momento.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {patients.map((patient) => (
            <div
              key={patient.cf}
              className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {patient.nome} {patient.cognome}
                </p>
                <p className="text-xs text-gray-600">
                  {patient.pending} esercizi in sospeso
                </p>
              </div>
              <Link
                href={`/logopedista/lista-pazienti/dettaglio-paziente/${patient.cf}`}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Vai al dettaglio
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
