import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { OrdersClient } from './OrdersClient';

const PAGE_SIZE = Number(process.env.ORDERS_PAGE_SIZE) || 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {

  const { userId } = await auth();

  const sellerRepo = new PrismaSellerRepository();
  const sellerResult = await sellerRepo.findById(userId!);
  if (!sellerResult.success) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full">
        <ErrorBanner title="Error de autenticación" message={sellerResult.error} />
      </div>
    );
  }
  const seller = sellerResult.data;
  if (!seller || !seller.storeId) redirect('/no-store');

  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const orderRepo = new PrismaOrderRepository();
  const orderResult = await orderRepo.findByStore(seller.storeId, page, PAGE_SIZE, status);
  
  const orders = orderResult.success ? orderResult.data.data : [];
  const pagination = orderResult.success
    ? {
        total: orderResult.data.total,
        page: orderResult.data.page,
        pageSize: orderResult.data.pageSize,
        totalPages: orderResult.data.totalPages,
      }
    : { total: 0, page, pageSize: PAGE_SIZE, totalPages: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {!orderResult.success && (
        <ErrorBanner 
          title="Atención" 
          message="No se pudieron cargar las órdenes. La tabla se muestra vacía temporalmente por un problema de conexión." 
        />
      )}
      <OrdersClient
        orders={orders}
        total={pagination.total}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        activeStatus={status ?? 'ALL'}
      />
    </div>
  );
}
