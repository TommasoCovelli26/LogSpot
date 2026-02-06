"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavLinks from './nav-links'; // Riferimento relativo alla stessa cartella
import { lusitana } from '../fonts'; // Riferimento relativo alla cartella superiore (app/ui/fonts.ts)

export default function SideNav() {
  const [utente, setUtente] = useState<any>(null);
  const isLogopedista = utente?.ruolo === "logopedista";

  useEffect(() => {
    const u = localStorage.getItem("utente");
    if (u) setUtente(JSON.parse(u));
  }, []);

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className={`mb-2 flex h-20 items-end justify-start rounded-md p-4 md:h-40 ${
          isLogopedista ? "bg-yellow-500" : "bg-blue-800"
        }`}
        href="/"
      >
        <div className={`w-32 text-white md:w-40 ${lusitana.className} text-2xl font-bold`}>
          LogSpot
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <div className="flex h-[48px] w-full items-center justify-center rounded-md bg-gray-100 p-3 text-xs font-light text-gray-500 md:justify-start">
          <p className="hidden md:block">LogSpot © 2026</p>
        </div>
      </div>
    </div>
  );
} 