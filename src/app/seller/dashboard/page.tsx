import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { Package, TrendingUp, AlertCircle, ShoppingCart, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { OrderStatusBadge } from './orders/OrderStatusBadge';
import { MetricCard } from '@/components/ui/MetricCard';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

async function getEarningsFromPaymentsApi(token: string): Promise<number | null> {
  const baseUrl = process.env.PAYMENTS_API_URL;
  if (!baseUrl) return 1000;

  try {
    const res = await fetch(`${baseUrl}/api/payments/earnings?recipientType=SELLER`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const data = await res.json();
    const earnings = data?.totalEarnings;

    return typeof earnings === 'number' ? earnings : null;
  } catch {
    return null;
  }
}

const PAGE_SIZE = Number(process.env.ORDERS_PAGE_SIZE) || 10;

export default async function DashboardPage() {

  const { userId, getToken } = await auth();

  const sellerRepo = new PrismaSellerRepository();
  const sellerResult = await sellerRepo.findById(userId!);
  if (!sellerResult.success) {
    throw new Error(sellerResult.error);
  }
  const seller = sellerResult.data;

  if (!seller || !seller.storeId) redirect('/no-store');

  const orderRepo = new PrismaOrderRepository();
  const productRepo = new PrismaProductRepository();

  const [orderResult, productsResult, pendingPaymentsOrdersResult] = await Promise.all([
    orderRepo.findByStore(seller.storeId, 1, PAGE_SIZE),
    productRepo.findByStore(seller.storeId),
    orderRepo.findPendingsPaymentsByStore(seller.storeId),
  ]);

  const orders = orderResult.success ? orderResult.data.data : [];
  const pendingPaymentsOrders = pendingPaymentsOrdersResult.success ? pendingPaymentsOrdersResult.data : [];
  const products = productsResult.success ? productsResult.data : [];

  const hasPartialError = !orderResult.success || !pendingPaymentsOrdersResult.success || !productsResult.success;


  const token = await getToken();
  const earningsFromApi = token ? await getEarningsFromPaymentsApi(token) : null;
  const totalRevenue = earningsFromApi ?? 0;

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {hasPartialError && (
        <ErrorBanner
          title="Información parcial"
          message="Algunos datos no pudieron cargarse correctamente en este momento. Estamos mostrando la información disponible."
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Resumen de Actividad</h2>
          <p className="text-zinc-500 mt-1">Monitorea las ventas y órdenes de tu corralón en tiempo real.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Órdenes Pendientes"
          value={String(pendingPaymentsOrders.length)}
          subtitle="Requieren atención"
          icon={<AlertCircle className="text-orange-500" size={24} />}
        />
        <MetricCard
          title="Productos sin Stock"
          value={String(outOfStockCount)}
          subtitle="Requieren reposición"
          icon={<Package className="text-red-500" size={24} />}
        />
        <MetricCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          subtitle=""
          icon={<TrendingUp className="text-emerald-500" size={24} />}
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



