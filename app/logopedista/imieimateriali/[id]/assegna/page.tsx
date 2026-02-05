import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/ui/fonts';
import AssignToPatient from '../../../ricerca-materiali/[id]/assegna/AssignToPatient';

export default async function AssignMyMaterialPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const activityId = parseInt(id);

  // 1. Recupera ID Logopedista dai cookie
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('utente');
  let logopedistaId = '';
  
  if (userCookie) {
     try {
       const userData = JSON.parse(userCookie.value);
       logopedistaId = userData.utente?.pIva || '';
     } catch (e) {
       console.error("Errore parsing cookie", e);
     }
  }

  // 2. Preleva i pazienti (Fondamentale: li passiamo al componente per evitare l'errore)
  const patients = db.prepare(`
    SELECT cf, nome, cognome 
    FROM Paziente 
    WHERE id_logopedista = ?
  `).all(logopedistaId) as any[];

  // 3. Recupera dettagli attività
  const activity = db.prepare('SELECT * FROM Attivita WHERE cod = ?').get(activityId) as any;

  if (!activity) notFound();

  return (
    <main className="w-full min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          href={`/logopedista/imieimateriali/${id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium uppercase text-sm tracking-wider"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Torna al dettaglio
        </Link>

        <h1 className={`${lusitana.className} text-3xl md:text-4xl font-bold text-yellow-400 mb-4`}>
          {activity.titolo}
        </h1>

        <div className="bg-white p-6 rounded-lg border border-gray-100">
          {/* Passiamo activityId e patients. L'errore sparirà se AssignToPatient.tsx è aggiornato */}
          <AssignToPatient activityId={activityId} patients={patients} />
        </div>
      </div>
    </main>
  );
}