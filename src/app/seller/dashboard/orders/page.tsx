import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import { OrdersClient } from './OrdersClient';

export default async function OrdersPage() {
  await requireRole([APP_ROLES.SELLER]);
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);
  if (!seller || !seller.storeId) redirect('/seller/onboarding');

  const orderRepo = new PrismaOrderRepository();
  const orders = await orderRepo.findByStore(seller.storeId);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <OrdersClient orders={orders} />
    </div>
  );
}
