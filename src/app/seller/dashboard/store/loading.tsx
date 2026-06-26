import { Store as StoreIcon } from 'lucide-react';

export default function StoreLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <StoreIcon className="w-6 h-6 text-zinc-300" />
          <div className="h-8 bg-zinc-200 rounded-md w-40 animate-pulse"></div>
        </h1>
        <div className="h-4 bg-zinc-100 rounded-md w-72 mt-2 animate-pulse"></div>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm p-6">
        <div className="space-y-6">
          {/* Campo 1 */}
          <div>
            <div className="h-4 bg-zinc-200 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-11 bg-zinc-50 border border-zinc-100 rounded-lg w-full animate-pulse"></div>
          </div>

          {/* Campo 2 */}
          <div>
            <div className="h-4 bg-zinc-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-11 bg-zinc-50 border border-zinc-100 rounded-lg w-full animate-pulse"></div>
          </div>

          {/* Campo 3 (Textarea) */}
          <div>
            <div className="h-4 bg-zinc-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-32 bg-zinc-50 border border-zinc-100 rounded-lg w-full animate-pulse"></div>
          </div>

          {/* Campo 4 */}
          <div>
            <div className="h-4 bg-zinc-200 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-3 bg-zinc-100 rounded w-80 mb-3 animate-pulse"></div>
            <div className="h-11 bg-zinc-50 border border-zinc-100 rounded-lg w-full sm:w-1/2 animate-pulse"></div>
          </div>

          {/* Botón Guardar */}
          <div className="pt-4 border-t border-zinc-200 flex justify-end">
            <div className="h-10 bg-zinc-200 rounded-lg w-40 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
