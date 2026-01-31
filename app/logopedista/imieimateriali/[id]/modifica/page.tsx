import { notFound } from 'next/navigation';
import { fetchActivityById } from '../../../../lib/activities';
import EditForm from '../../../../ui/logopedista/edit-form';

export default async function EditActivityPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const activity = await fetchActivityById(id);

  if (!activity) {
    notFound();
  }

  return (
    <main className="w-full min-h-screen bg-white p-4 md:p-8 font-sans">
      <EditForm activity={activity} />
    </main>
  );
}