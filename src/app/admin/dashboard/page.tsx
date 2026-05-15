import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { Store, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { OrderStatus, StoreStatus } from '@prisma/client';
import { MetricCard } from '@/components/ui/MetricCard';

export default async function AdminDashboardPage() {
  await requireRole([APP_ROLES.ADMIN]);

  const storeRepo = new PrismaStoreRepository();
  const orderRepo = new PrismaOrderRepository();
  const productRepo = new PrismaProductRepository();

  const [stores, orders, products] = await Promise.all([
    storeRepo.findAll(),
    orderRepo.findAll(),
    productRepo.findAll()
  ]);

  const activeStores = stores.filter((s: { status: StoreStatus }) => s.status === StoreStatus.OPEN || s.status === StoreStatus.CLOSE).length;
  const suspendedStores = stores.filter((s: { status: StoreStatus }) => s.status === StoreStatus.SUSPENDED).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Panel de Administración Global</h2>
        <p className="text-zinc-500 mt-1">Visión general del estado de la plataforma BuildNow.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tiendas Activas"
          value={String(activeStores)}
          subtitle={`${suspendedStores} suspendidas`}
          icon={<Store className="text-blue-500" size={24} />}
        />
        <MetricCard
          title="Órdenes (Global)"
          value={String(orders.total)}
          subtitle="Total histórico procesado"
          icon={<ShoppingCart className="text-orange-500" size={24} />}
        />
        <MetricCard
          title="Productos (Global)"
          value={String(products.length)}
          subtitle="En la plataforma global"
          icon={<Package className="text-emerald-500" size={24} />}
        />
      </div>
    </div>
  );
}

