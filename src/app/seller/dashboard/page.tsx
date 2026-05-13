import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { Package, TrendingUp, AlertCircle, CheckCircle2, ShoppingCart, Clock, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { OrderStatus } from '@prisma/client';
import { OrderStatusBadge } from './orders/OrderStatusBadge';

export default async function DashboardPage() {
  await requireRole([APP_ROLES.SELLER]);
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  console.log(userId);
  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);
  console.log(seller);

  if (!seller || !seller.storeId) redirect('/seller/onboarding');

  const orderRepo = new PrismaOrderRepository();
  const productRepo = new PrismaProductRepository();

  const [orders, products] = await Promise.all([
    orderRepo.findByStore(seller.storeId),
    productRepo.findByStore(seller.storeId),
  ]);

  // Métricas calculadas
  const pendingOrders = orders.filter(
    (o) => o.status === OrderStatus.PENDING_PAYMENT || o.status === OrderStatus.CONFIRMED
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDelivered = orders.filter(
    (o) => o.status === OrderStatus.DELIVERED && new Date(o.updatedAt) >= today
  );
  const todayRevenue = todayDelivered.reduce((sum, o) => sum + o.totalAmount, 0);
  const todayDeliveredCount = todayDelivered.length;

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Resumen de Actividad</h2>
          <p className="text-zinc-500 mt-1">Monitorea las ventas y órdenes de tu corralón en tiempo real.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Órdenes Pendientes"
          value={String(pendingOrders)}
          subtitle="Requieren atención"
          icon={<AlertCircle className="text-orange-500" size={24} />}
        />
        <MetricCard
          title="Ventas del Día"
          value={`$${todayRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          subtitle="Órdenes entregadas hoy"
          icon={<TrendingUp className="text-emerald-500" size={24} />}
        />
        <MetricCard
          title="Órdenes Entregadas"
          value={String(todayDeliveredCount)}
          subtitle="Hoy"
          icon={<CheckCircle2 className="text-blue-500" size={24} />}
        />
        <MetricCard
          title="Productos sin Stock"
          value={String(outOfStockCount)}
          subtitle="Requieren reposición"
          icon={<Package className="text-red-500" size={24} />}
        />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">Órdenes Recientes</h3>
          <Link
            href="/seller/dashboard/orders"
            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-500 font-medium transition-colors"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
                <ShoppingCart className="text-zinc-400" size={32} />
              </div>
              <h4 className="text-zinc-900 font-medium">No hay órdenes nuevas</h4>
              <p className="text-zinc-500 mt-1 text-sm">Las órdenes que ingresen aparecerán aquí para que las prepares.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Referencia</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Monto</th>
                  <th className="px-6 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono text-sm text-zinc-900">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-3 font-medium text-zinc-900">
                        ${order.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3 text-sm text-zinc-500">
                        {new Date(order.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-zinc-50 group-hover:scale-110 transition-transform duration-500 z-0"></div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 ring-1 ring-zinc-100 group-hover:bg-white group-hover:ring-zinc-200 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}

