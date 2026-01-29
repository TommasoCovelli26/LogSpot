import Carousel from '../ui/pubblica/carosello';
import { lusitana } from '../ui/fonts';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex flex-col gap-6 items-center justify-center min-h-screen">
      
      {/* Carosello con le immagini*/}
      <Carousel />

      {/* Sezione di presentazione */}
      <header className="text-center">
        <h1 className={`${lusitana.className} text-5xl text-blue-600 md:text-6xl font-bold`}>
          LogSpot
        </h1>
        <p className="text-lg text-gray-600 mt-4">La piattaforma centralizzata per la logopedia italiana. 
        Un unico archivio per professionisti, un supporto reale per i pazienti.</p>
      </header>

      {/* Sezione di registrazione e i vantaggi per logopedisti e pazienti */}
      <h2 className="text-center text-3xl font-bold text-gray-800 mt-8">Registrati come...</h2>
      <section className="grid gap-4 md:grid-cols-2 text-center max-w-4xl w-full px-4">
        <Link
          href="/registrazione?ruolo=logopedista"
          className="p-4 border rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <h3 className="font-bold text-blue-500">Logopedista</h3>
          <p className="text-sm">Gestisci i tuoi pazienti e crea attività personalizzate in pochi click.</p>
        </Link>
        <Link
          href="/registrazione?ruolo=paziente"
          className="p-4 border rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <h3 className="font-bold text-blue-500">Paziente</h3>
          <p className="text-sm">Accedi ai tuoi esercizi e segui il tuo percorso riabilitativo ovunque sei.</p>
        </Link>
      </section>
    </main>
  );
}