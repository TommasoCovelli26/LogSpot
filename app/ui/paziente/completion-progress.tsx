type CompletionProgressProps = {
  percentage: number;
  isLoading: boolean;
  message: string;
};

export default function CompletionProgress({
  percentage,
  isLoading,
  message,
}: CompletionProgressProps) {
  return (
    <div className="mb-6 rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
        <span>Completamento esercizi</span>
        <span>{isLoading ? "..." : `${percentage}%`}</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-blue-100">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{ width: `${isLoading ? 0 : percentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
        {message}
      </p>
    </div>
  );
}
