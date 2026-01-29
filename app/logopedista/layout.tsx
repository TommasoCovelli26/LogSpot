import SideNav from '../ui/logopedista/sidenav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* Colonna di sinistra: la SideNav */}
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      
      {/* Colonna di destra: il contenuto delle pagine (Homepage, Chi Siamo, etc.) */}
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}