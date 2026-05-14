'use client';

import { useState } from 'react';
import { Store, StoreStatus } from '@prisma/client';
import { Store as StoreIcon, Save, Info } from 'lucide-react';
import { updateStoreAction } from '@/app/actions/store.actions';

export function StoreClient({ store }: { store: Store }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      await updateStoreAction(store.id, formData);
      setSuccessMsg('Información de la tienda actualizada correctamente.');
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al actualizar la tienda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <StoreIcon className="w-6 h-6 text-orange-500" />
          Mi Tienda
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Administra la información pública y el estado de tu corralón.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm p-6">
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-start gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Nombre del Corralón
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={store.name}
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Ej: Corralón El Constructor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              required
              defaultValue={store.address}
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Ej: Av. San Martín 1234, Ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Descripción (Opcional)
            </label>
            <textarea
              name="description"
              rows={4}
              defaultValue={store.description || ''}
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              placeholder="Breve descripción de tu negocio, horarios, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Estado de la Tienda
            </label>
            <div className="text-sm text-zinc-500 mb-3">
              Si marcas tu tienda como Cerrada, no recibirás nuevos pedidos temporalmente.
            </div>
            <select
              name="status"
              required
              defaultValue={store.status}
              className="w-full sm:w-1/2 bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors appearance-none"
            >
              <option value={StoreStatus.OPEN}>Abierta (Recibir pedidos)</option>
              <option value={StoreStatus.CLOSE}>Cerrada (Pausar atención)</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
