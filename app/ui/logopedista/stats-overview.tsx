type StatsOverviewProps = {
  patients: number;
  assigned: number;
  completedToday: number;
  inProgress: number;
  isLoading: boolean;
};

type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
};

function SummaryCard({ title, value, description }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
        {title}
      </p>
      <p className="text-3xl font-bold text-blue-900 mt-2">
        {value}
      </p>
      <p className="text-xs text-gray-600 mt-2">{description}</p>
    </div>
  );
}

export default function StatsOverview({
  patients,
  assigned,
  completedToday,
  inProgress,
  isLoading,
}: StatsOverviewProps) {
  return (
    <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Totale pazienti"
        value={isLoading ? "..." : patients}
        description="Pazienti attivi assegnati"
      />
      <SummaryCard
        title="Esercizi assegnati"
        value={isLoading ? "..." : assigned}
        description="Assegnazioni complessive"
      />
      <SummaryCard
        title="Completati oggi"
        value={isLoading ? "..." : completedToday}
        description="Completati nella giornata"
      />
      <SummaryCard
        title="Esercizi in corso"
        value={isLoading ? "..." : inProgress}
        description="In svolgimento o in attesa"
      />
    </div>
  );
}
