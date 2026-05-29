import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { PrismaCategoryRepository } from '@/infrastructure/repositories/prisma/PrismaCategoryRepository';
import { ProductsClient } from './ProductsClient';
import { PAGE_SIZE } from '@/core/config/pagination';

export default async function ProductsPage() {
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

  const productRepo = new PrismaProductRepository();
  const categoryRepo = new PrismaCategoryRepository();

  const [paginatedResultObj, categoriesResult] = await Promise.all([
    productRepo.findPaginatedByStore({
      storeId: seller.storeId,
      pageNumber: 1,
      pageSize: PAGE_SIZE,
    }),
    categoryRepo.findAll(),
  ]);

  const hasPartialError = !paginatedResultObj.success || !categoriesResult.success;
  const errorMessage = "No se pudieron cargar todos los productos o categorías. Verifica tu conexión.";

  const rawProducts = paginatedResultObj.success ? paginatedResultObj.data.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  const pagination = paginatedResultObj.success
    ? {
      total: paginatedResultObj.data.total,
      page: paginatedResultObj.data.page,
      pageSize: paginatedResultObj.data.pageSize,
      totalPages: paginatedResultObj.data.totalPages,
    }
    : { total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };

  const serializedProducts = rawProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    weight: Number(p.weight),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {hasPartialError && (
        <ErrorBanner title="Atención" message={errorMessage} />
      )}
      <ProductsClient
        initialProducts={serializedProducts}
        categories={categories}
        storeId={seller.storeId}
        initialPagination={pagination}
      />
    </div>
  );
}
