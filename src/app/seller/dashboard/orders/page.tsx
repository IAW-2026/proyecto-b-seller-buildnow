import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { OrdersClient } from './OrdersClient';

const PAGE_SIZE = Number(process.env.ORDERS_PAGE_SIZE) || 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireRole([APP_ROLES.SELLER]);
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);
  if (!seller || !seller.storeId) redirect('/sign-in');

  const { page: pageParam, status } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const orderRepo = new PrismaOrderRepository();
  const result = await orderRepo.findByStore(seller.storeId, page, PAGE_SIZE, status);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <OrdersClient
        orders={result.data}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        totalPages={result.totalPages}
        activeStatus={status ?? 'ALL'}
      />
    </div>
  );
}
