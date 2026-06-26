'use client';

import { useClerk } from '@clerk/nextjs';
import { ServerCrash, LogOut } from 'lucide-react';

export default function NoStorePage() {
  const { signOut } = useClerk();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="flex flex-col items-center text-center max-w-md p-8 bg-white border border-zinc-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-6">
          <ServerCrash size={32} className="text-orange-500" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
          Error de configuración
        </h1>

        <p className="text-zinc-500 mb-6 text-sm">
          Tu cuenta no tiene una tienda asociada. Esto puede deberse a un error
          en la configuración del sistema. Por favor, contacta al administrador.
        </p>

        <button
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
