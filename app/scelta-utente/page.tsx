import Link from "next/link";

export default function SceltaUtentePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
			<h1 className="text-3xl font-bold text-gray-800">Scegli il tipo di registrazione</h1>

			<section className="flex w-full max-w-4xl flex-col gap-4">
				<Link
					href="/registrazione?ruolo=logopedista"
					className="w-full rounded-lg border bg-gray-50 p-6 text-center transition-colors hover:bg-blue-100"
				>
					<h3 className="text-xl font-bold text-blue-500">Logopedista</h3>
					<p className="mt-2 text-sm text-gray-600">
						Gestisci i tuoi pazienti e crea attività personalizzate in pochi click.
					</p>
				</Link>

				<Link
					href="/registrazione?ruolo=paziente"
					className="w-full rounded-lg border bg-gray-50 p-6 text-center transition-colors hover:bg-blue-100"
				>
					<h3 className="text-xl font-bold text-blue-500">Paziente</h3>
					<p className="mt-2 text-sm text-gray-600">
						Accedi ai tuoi esercizi e segui il tuo percorso riabilitativo ovunque sei.
					</p>
				</Link>
			</section>
		</main>
	);
}
