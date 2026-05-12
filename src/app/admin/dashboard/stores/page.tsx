import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { StoreStatus } from '@prisma/client';
import { StoreRowActions } from './StoreRowActions';
import { Store } from 'lucide-react';

export default async function AdminStoresPage() {
  await requireRole([APP_ROLES.ADMIN]);

  const storeRepo = new PrismaStoreRepository();
  const stores = await storeRepo.findAll();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Gestión de Corralones</h2>
        <p className="text-zinc-500 mt-1">Administra los corralones registrados en la plataforma. Puedes suspender accesos si inclumplen políticas.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {stores.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 mb-4">
              <Store className="text-zinc-400" size={32} />
            </div>
            <h4 className="text-zinc-900 font-medium">No hay tiendas registradas</h4>
            <p className="text-zinc-500 mt-1 text-sm">Aún no se ha unido ningún vendedor a la plataforma.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre de la Tienda</th>
                <th className="px-6 py-4 font-medium">Dirección</th>
                <th className="px-6 py-4 font-medium">Fecha Alta</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {stores.map((store) => {
                const isSuspended = store.status === StoreStatus.SUSPENDED;
                const isOpen = store.status === StoreStatus.OPEN;

                return (
                  <tr key={store.id} className={`hover:bg-zinc-50 transition-colors ${isSuspended ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900">{store.name}</span>
                        <span className="text-xs text-zinc-500 font-mono mt-0.5">ID: {store.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {store.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(store.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        isSuspended ? 'bg-red-50 text-red-700 ring-red-600/10' :
                        isOpen ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                        'bg-zinc-50 text-zinc-600 ring-zinc-500/10'
                      }`}>
                        {isSuspended ? 'Suspendida' : isOpen ? 'Abierto' : 'Cerrado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      <StoreRowActions storeId={store.id} status={store.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}