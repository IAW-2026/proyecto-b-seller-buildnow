
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { Store, ShoppingCart, Package } from 'lucide-react';
import { StoreStatus } from '@prisma/client';

import { MetricCard } from '@/components/ui/MetricCard';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export default async function AdminDashboardPage() {
  const storeRepo = new PrismaStoreRepository();
  const orderRepo = new PrismaOrderRepository();
  const productRepo = new PrismaProductRepository();

  const [
    activasResult,
    suspendidasResult,
    ordersResult,
    productsResult
  ] = await Promise.all([
    storeRepo.countByStatus([StoreStatus.OPEN, StoreStatus.CLOSE]),
    storeRepo.countByStatus([StoreStatus.SUSPENDED]),
    orderRepo.countAll(),
    productRepo.countAll()
  ]);

  const cantDeTiendasActivas = activasResult.success ? activasResult.data : 0;
  const cantDeTiendasSuspendidas = suspendidasResult.success ? suspendidasResult.data : 0;
  const totalOrders = ordersResult.success ? ordersResult.data : 0;
  const totalProducts = productsResult.success ? productsResult.data : 0;

  const hasPartialError = !activasResult.success || !suspendidasResult.success || !ordersResult.success || !productsResult.success;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de Administración Global</h2>
        <p className="text-zinc-500 mt-1">Visión general del estado de la plataforma BuildNow.</p>
      </div>

      {hasPartialError && (
        <ErrorBanner 
          title="Atención" 
          message="No se pudieron cargar algunas métricas. Los valores se muestran en 0 por un problema de conexión." 
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tiendas Activas"
          value={String(cantDeTiendasActivas)}
          subtitle={`${cantDeTiendasSuspendidas} suspendidas`}
          icon={<Store className="text-blue-500" size={24} />}
        />
        <MetricCard
          title="Órdenes (Global)"
          value={String(totalOrders)}
          subtitle="Total histórico procesado"
          icon={<ShoppingCart className="text-orange-500" size={24} />}
        />
        <MetricCard
          title="Productos (Global)"
          value={String(totalProducts)}
          subtitle="En la plataforma global"
          icon={<Package className="text-emerald-500" size={24} />}
        />
      </div>
    </div>
  );
}

