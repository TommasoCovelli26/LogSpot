import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { fetchActivityById } from '../../../../lib/activities';
import { lusitana } from '../../../../ui/fonts';
import AssignToPatient from './AssignToPatient';

export default async function AssignPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const activity = await fetchActivityById(id);

  if (!activity || !activity.accessibilita) notFound();

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          href="/logopedista/ricerca-materiali"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna alla ricerca
        </Link>

        <h1 className={`${lusitana.className} text-3xl md:text-4xl font-bold text-yellow-400 mb-4`}>
          {activity.titolo}
        </h1>

        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <AssignToPatient activityId={String(activity.cod)} />
        </div>
      </div>
    </main>
  );
}
