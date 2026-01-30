'use client';

import {
  UserGroupIcon, // Per Lista Pazienti 
  HomeIcon,
  DocumentDuplicateIcon, // Per I Miei Materiali 
  MagnifyingGlassIcon, // Per Ricerca Materiale 
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Campi basati sul Modello di Navigazione di LogSpot 
const links = [
  { name: 'Home', href: '/logopedista', icon: HomeIcon },
  { name: 'Lista Pazienti', href: '/logopedista/lista-pazienti', icon: UserGroupIcon },
  { name: 'I Miei Materiali', href: '/dashboard/logopedista/materiali', icon: DocumentDuplicateIcon },
  { name: 'Ricerca Materiale', href: '/dashboard/logopedista/ricerca', icon: MagnifyingGlassIcon },
    { name: 'Profilo', href: '/dashboard/logopedista/profilo', icon: MagnifyingGlassIcon },

];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              { 'bg-sky-100 text-blue-600': pathname === link.href },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}