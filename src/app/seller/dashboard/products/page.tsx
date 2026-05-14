import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { PrismaCategoryRepository } from '@/infrastructure/repositories/prisma/PrismaCategoryRepository';
import { ProductsClient } from './ProductsClient';

export default async function ProductsPage() {
  await requireRole([APP_ROLES.SELLER]);
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);
  if (!seller || !seller.storeId) redirect('/sign-in');

  const productRepo = new PrismaProductRepository();
  const categoryRepo = new PrismaCategoryRepository();

  const [products, categories] = await Promise.all([
    productRepo.findByStore(seller.storeId),
    categoryRepo.findAll(),
  ]);

  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    weight: Number(p.weight),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ProductsClient products={serializedProducts} categories={categories} />
    </div>
  );
}
