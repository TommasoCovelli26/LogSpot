'use client';

import {
  HomeIcon,
  InformationCircleIcon,
  UserCircleIcon,
  RectangleStackIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const [utente, setUtente] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("utente");
    if (u) setUtente(JSON.parse(u));
  }, []);

  const logout = () => {
    const conferma = window.confirm("Sei sicuro di voler effettuare il logout?");
    if (!conferma) return;
    localStorage.removeItem("utente");
    setUtente(null);
    router.push("/");
  };

  const linkClass = (href: string) =>
    clsx(
      'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
      { 'bg-sky-100 text-blue-600': pathname === href }
    );

  const linksPubblici = [
    { name: 'Homepage', href: '/', icon: HomeIcon },
    { name: 'Chi Siamo', href: '/chi-siamo', icon: InformationCircleIcon },
  ];

  const linksLogopedista = [
    { name: 'Dashboard', href: '/dashboard', icon: RectangleStackIcon },
    { name: 'Pazienti', href: '/logopedista/lista-pazienti', icon: UserGroupIcon },
    { name: 'Attività', href: '/logopedista/imieimateriali', icon: ClipboardDocumentListIcon },
    { name: 'Profilo', href: '/profilo', icon: UserCircleIcon },
  ];

  const linksPaziente = [
    { name: 'Dashboard', href: '/dashboard', icon: RectangleStackIcon },
    { name: 'I miei esercizi', href: '/paziente/esercizi', icon: ClipboardDocumentListIcon },
    { name: 'I miei Progressi', href: '/paziente/progressi', icon: ChartBarIcon },
    { name: 'Profilo', href: '/profilo', icon: UserCircleIcon },
  ];

  return (
    <>
      {/* LINK PUBBLICI */}
      {linksPubblici.map((link) => {
        const Icon = link.icon;
        return (
          <Link key={link.name} href={link.href} className={linkClass(link.href)}>
            <Icon className="w-6" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        );
      })}

      {/* SE NON LOGGATO */}
      {!utente && (
        <Link href="/login" className={linkClass("/login")}>
          <UserCircleIcon className="w-6" />
          <span className="hidden md:block">Accedi</span>
        </Link>
      )}

      {/* SE LOGOPEDISTA */}
      {utente?.ruolo === "logopedista" &&
        linksLogopedista.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.name} href={link.href} className={linkClass(link.href)}>
              <Icon className="w-6" />
              <span className="hidden md:block">{link.name}</span>
            </Link>
          );
        })}

      {/* SE PAZIENTE */}
      {utente?.ruolo === "paziente" &&
        linksPaziente.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.name} href={link.href} className={linkClass(link.href)}>
              <Icon className="w-6" />
              <span className="hidden md:block">{link.name}</span>
            </Link>
          );
        })}

      {/* LOGOUT */}
      {utente && (
        <button
          onClick={logout}
          className="flex h-[48px] items-center gap-2 rounded-md p-3 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <ArrowRightOnRectangleIcon className="w-6" />
          <span className="hidden md:block">Logout</span>
        </button>
      )}
    </>
  );
}
