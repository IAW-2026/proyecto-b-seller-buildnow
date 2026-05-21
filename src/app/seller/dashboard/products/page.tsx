import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { PrismaCategoryRepository } from '@/infrastructure/repositories/prisma/PrismaCategoryRepository';
import { ProductsClient } from './ProductsClient';
import { PAGE_SIZE } from '@/core/config/pagination';

export default async function ProductsPage() {
  await requireRole([APP_ROLES.SELLER]);
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);
  if (!seller || !seller.storeId) redirect('/sign-in');

  const productRepo = new PrismaProductRepository();
  const categoryRepo = new PrismaCategoryRepository();

  const [paginatedResult, categories] = await Promise.all([
    productRepo.findPaginatedByStore({
      storeId: seller.storeId,
      pageNumber: 1,
      pageSize: PAGE_SIZE,
    }),
    categoryRepo.findAll(),
  ]);

  const serializedProducts = paginatedResult.data.map((p) => ({
    ...p,
    price: Number(p.price),
    weight: Number(p.weight),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <ProductsClient
        initialProducts={serializedProducts}
        categories={categories}
        storeId={seller.storeId}
        initialPagination={{
          total: paginatedResult.total,
          page: paginatedResult.page,
          pageSize: paginatedResult.pageSize,
          totalPages: paginatedResult.totalPages,
        }}
      />
    </div>
  );
}
