'use client';

import { Patient } from '@/lib/patients';
import { formatDateToLocal } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientsTable({ patients }: { patients: any[] }) {
  const router = useRouter();

  if (!patients || patients.length === 0) {
    return (
      <div className="mt-6 text-center py-10">
        <p className="text-gray-500">Nessun paziente trovato</p>
      </div>
    );
  }

  const handleRowClick = (cf: string) => {
    router.push(`/logopedista/lista-pazienti/dettaglio-paziente/${cf}`);
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile view */}
          <div className="md:hidden">
            {patients.map((patient: any) => (
              <Link
                key={patient.cf}
                href={`/logopedista/lista-pazienti/dettaglio-paziente/${patient.cf}`}
              >
                <div
                  className="mb-2 w-full rounded-md bg-white p-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <p className="font-medium">{patient.nome} {patient.cognome}</p>
                      </div>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-medium">CF: {patient.cf}</p>
                      {patient.numTelefono && (
                        <p className="text-sm text-gray-500">{patient.numTelefono}</p>
                      )}
                      {patient.dataNascita && (
                        <p className="text-sm text-gray-500">
                          {formatDateToLocal(patient.dataNascita)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop view */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Cognome
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Nome
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Codice Fiscale
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Telefono
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Data Nascita
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {patients.map((patient: any) => (
                <tr
                  key={patient.cf}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(patient.cf)}
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {patient.cognome}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.nome}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                    {patient.cf}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.numTelefono || '—'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {patient.dataNascita
                      ? formatDateToLocal(patient.dataNascita)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}