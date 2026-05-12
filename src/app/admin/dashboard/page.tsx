import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { Store, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { OrderStatus, StoreStatus } from '@prisma/client';

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

  const totalStores = stores.length;
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
          value={String(orders.length)}
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

function MetricCard({ title, value, subtitle, icon }: { title: string, value: string, subtitle: string, icon: React.ReactNode }) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 ring-1 ring-zinc-100 group-hover:bg-white transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}