import Link from 'next/link';
import { ArrowLeft, Store } from 'lucide-react';

export default function NotFoundStore() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-center w-20 h-20 bg-zinc-100 rounded-full mb-6">
        <Store className="w-10 h-10 text-zinc-400 opacity-50" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-900 mb-2">Tienda no encontrada</h2>
      <p className="text-zinc-500 mb-8 max-w-md">
        No hemos podido encontrar la información de la tienda que estás buscando. Es posible que haya sido eliminada o que el enlace sea incorrecto.
      </p>
      <Link 
        href="/admin/dashboard/stores"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Volver a las tiendas
      </Link>
    </div>
  );
}
