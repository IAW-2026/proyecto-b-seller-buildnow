import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, MapPin, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function AdminStoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([APP_ROLES.ADMIN]);

  const { id } = await params;

  const storeRepo = new PrismaStoreRepository();
  const productRepo = new PrismaProductRepository();
  const orderRepo = new PrismaOrderRepository();

  const store = await storeRepo.findById(id);

  if (!store) {
    notFound();
  }

  const [products, orders] = await Promise.all([
    productRepo.findByStore(id),
    orderRepo.findByStore(id)
  ]);

  const isSuspended = store.status === 'SUSPENDED';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Cabecera y botón de regreso */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-4">
          <Link
            href="/admin/dashboard/stores"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={16} /> Volver a Corralones
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{store.name}</h2>
              {isSuspended && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 ring-1 ring-inset ring-red-600/20">
                  <ShieldAlert size={14} /> Suspendida
                </span>
              )}
            </div>
            <p className="text-zinc-500 mt-1 max-w-2xl">{store.description || 'Sin descripción proporcionada'}</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <MapPin className="text-zinc-400" size={20} />
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase">Ubicación</p>
            <p className="text-sm text-zinc-900">{store.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <Calendar className="text-zinc-400" size={20} />
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase">Fecha de Alta</p>
            <p className="text-sm text-zinc-900">{new Date(store.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <Package className="text-zinc-400" size={20} />
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase">Total Productos</p>
            <p className="text-sm text-zinc-900 font-bold">{products.length}</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-200 w-full" />

      {/* Catálogo de Productos*/}
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-zinc-500" />
          Catálogo Activo
        </h3>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Este corralón aún no ha cargado productos.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Producto</th>
                  <th className="px-6 py-3 font-medium">Precio</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-zinc-900">{p.name}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-600">
                      ${Number(p.price).toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.stock > 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                        }`}>
                        {p.stock} un.
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}