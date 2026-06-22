'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Seller Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6 ring-8 ring-red-50/50">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">Error en la vista</h2>
      <p className="text-zinc-500 mb-8 max-w-md text-center text-sm">
        Ha ocurrido un problema al intentar cargar esta sección del panel. Podés intentar recargarla, o utilizar el menú lateral para navegar a otra página.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
      >
        <RefreshCcw size={18} />
        Reintentar carga
      </button>
    </div>
  );
}
