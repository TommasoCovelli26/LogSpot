type DashboardStatsProps = {
  total: number;
  completed: number;
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

export default function DashboardStats({
  total,
  completed,
  inProgress,
  isLoading,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard
        title="Esercizi totali"
        value={isLoading ? "..." : total}
        description="Totale degli esercizi assegnati"
      />
      <SummaryCard
        title="Esercizi completati"
        value={isLoading ? "..." : completed}
        description="Esercizi conclusi con esito registrato"
      />
      <SummaryCard
        title="Esercizi in corso"
        value={isLoading ? "..." : inProgress}
        description="Esercizi avviati o in attesa di completamento"
      />
    </div>
  );
}
