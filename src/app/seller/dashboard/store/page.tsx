import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { StoreClient } from './StoreClient';

export default async function StorePage() {
  const { userId } = await auth();

  const sellerRepo = new PrismaSellerRepository();
  const sellerResult = await sellerRepo.findById(userId!);
  if (!sellerResult.success) {
    throw new Error(sellerResult.error);
  }
  const seller = sellerResult.data;

  if (!seller || !seller.storeId) redirect('/no-store');

  const storeRepo = new PrismaStoreRepository();
  const storeResult = await storeRepo.findById(seller.storeId);
  if (!storeResult.success) {
    throw new Error(storeResult.error);
  }
  const store = storeResult.data;

  if (!store) redirect('/sign-in');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <StoreClient store={store} />
    </div>
  );
}
