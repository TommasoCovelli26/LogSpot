import { lusitana } from '../../ui/fonts';

export default function Page() {
  return (
    <main className="max-w-4xl">
      <h1 className={`${lusitana.className} mb-6 text-3xl text-blue-600 font-bold text-center mt-10`}>
        Chi Siamo
      </h1>

      <section className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg text-center px-4 md:px-0">
          <strong>LogSpot</strong>, un progetto nato dall'esigenza di colmare un vuoto tecnologico e organizzativo nel panorama della logopedia italiana. Il nostro team ha lavorato con l'obiettivo di creare la prima piattaforma centralizzata e accessibile dedicata interamente a questa disciplina.
Il nome stesso, LogSpot, unisce 'Logopedia' e 'Spot', a indicare il nostro obiettivo: fare luce su un settore spesso frammentato e offrire un punto di riferimento unico. Non abbiamo voluto creare semplicemente un contenitore di file, ma un vero ecosistema digitale che faciliti il lavoro dei professionisti e migliori la qualità della vita dei pazienti.

        </p>

        <div className="grid gap-8 md:grid-cols-2 mt-10">
          <div className="border-l-4 border-blue-500 pl-4">
            <h2 className={`${lusitana.className} text-xl font-semibold text-blue-800`}>La nostra Vision</h2>
            <p className="mt-2">
              Vogliamo eliminare la frammentazione delle risorse riabilitative, creando un punto di incontro digitale 
              tra il professionista e il paziente.
            </p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h2 className={`${lusitana.className} text-xl font-semibold text-blue-800`}>Collaborazione</h2>
            <p className="mt-2">
              LogSpot non è solo un archivio, ma un ecosistema dove i logopedisti possono condividere materiali 
              validati e ricevere feedback dalla comunità.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-xl">
          <h2 className={`${lusitana.className} text-xl font-semibold mb-4 text-blue-900 text-center`}>
            Il Team di Sviluppo
          </h2>
          <div className="flex gap-4 mt-6">
            <p className="flex-1 text-left">Capriati Marco</p>
            <p className="flex-1 text-center">Covelli Tommaso</p>
            <p className="flex-1 text-right">Bottalico Alessio</p>
          </div>
        </div>
      </section>
    </main>
  );
}