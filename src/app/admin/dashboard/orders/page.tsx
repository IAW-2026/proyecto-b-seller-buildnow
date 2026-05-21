import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { OrderStatusBadge } from '@/app/seller/dashboard/orders/OrderStatusBadge';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/ui/Pagination';
import { StoreFilter } from './StoreFilter';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; storeId?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const storeId = params.storeId || '';
  const PAGE_SIZE = 10;

  const orderRepo = new PrismaOrderRepository();
  const storeRepo = new PrismaStoreRepository();
  
  const [paginatedResult, stores] = await Promise.all([
    orderRepo.findAll(page, PAGE_SIZE, storeId),
    storeRepo.findAll()
  ]);
  
  const { data: orders, total, totalPages } = paginatedResult;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Órdenes Globales</h2>
          <p className="text-zinc-500 mt-1">Visor de todas las órdenes del sistema interactuando a lo largo de todos los corralones.</p>
        </div>
        <div className="flex-shrink-0">
          <StoreFilter 
            stores={stores.map(s => ({ id: s.id, name: s.name }))} 
            currentStoreId={storeId} 
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 mb-4">
              <ShoppingCart className="text-zinc-400" size={32} />
            </div>
            <h4 className="text-zinc-900 font-medium">No hay órdenes en la plataforma</h4>
            <p className="text-zinc-500 mt-1 text-sm">Aún no se ha realizado ninguna venta globalmente.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Referencia</th>
                <th className="px-6 py-4 font-medium">Corralón</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Monto</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-zinc-900">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/dashboard/stores/${order.storeId}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {order.store?.name || 'Corralón Desconocido'}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    ${Number(order.totalAmount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}