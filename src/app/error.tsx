'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[80vh] bg-gray-50 px-4">
      <div className="flex flex-col items-center text-center max-w-md p-8 bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
          <AlertOctagon size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Algo salió mal</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Ha ocurrido un error inesperado. Ya hemos sido notificados y estamos trabajando para solucionarlo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <RefreshCcw size={18} />
            Reintentar
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Home size={18} />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}