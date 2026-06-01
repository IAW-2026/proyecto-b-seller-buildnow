'use client';

import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { ShieldX, LogOut } from 'lucide-react';

const COUNTDOWN_SECONDS = 5;

export default function NoAutorizadoPage() {
  const { signOut } = useClerk();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      signOut({ redirectUrl: '/sign-in' });
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, signOut]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="flex flex-col items-center text-center max-w-md p-8 bg-white border border-zinc-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
          <ShieldX size={32} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
          Acceso no autorizado
        </h1>

        <p className="text-zinc-500 mb-6 text-sm">
          Tu rol no tiene permisos para acceder a esta sección de la aplicación.
        </p>

        <div className="w-full bg-zinc-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-zinc-600">
            Tu sesión se cerrará automáticamente en{' '}
            <span className="font-bold text-red-600 tabular-nums">{secondsLeft}</span>
            {secondsLeft === 1 ? ' segundo' : ' segundos'}…
          </p>
          <div className="mt-2 h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / COUNTDOWN_SECONDS) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Cerrar sesión ahora
        </button>
      </div>
    </div>
  );
}
