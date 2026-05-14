import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { StoreClient } from './StoreClient';

export default async function StorePage() {
  await requireRole([APP_ROLES.SELLER]);
  
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);

  if (!seller || !seller.storeId) redirect('/sign-in');

  const storeRepo = new PrismaStoreRepository();
  const store = await storeRepo.findById(seller.storeId);

  if (!store) redirect('/sign-in');

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <StoreClient store={store} />
    </div>
  );
}
