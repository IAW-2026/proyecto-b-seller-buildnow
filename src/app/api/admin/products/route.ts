import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';

const productRepo = new PrismaProductRepository();

/**
 * Obtiene la lista paginada de productos (vista admin).
 *
 * Contrato: GET /api/admin/products
 * Query params:
 *   - pageNumber  {number}  Página a solicitar (default: 1)
 *   - pageSize    {number}  Tamaño de página (default: 10)
 *   - categoryID  {string}  Filtrar por categoría (opcional)
 *   - storeID     {string}  Filtrar por tienda (opcional)
 *
 * Respuesta:
 * {
 *   data:       Product[],
 *   total:      number,
 *   page:       number,
 *   pageSize:   number,
 *   totalPages: number,
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string | undefined;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Tu rol no tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;

    const pageNumber = Math.max(1, Number(searchParams.get('pageNumber') ?? '1'));
    const pageSize   = Math.max(1, Number(searchParams.get('pageSize')   ?? '10'));
    const categoryId = searchParams.get('categoryID') ?? undefined;
    const storeId    = searchParams.get('storeID')    ?? undefined;

    const productResult = await productRepo.findPaginatedForAdmin({
      categoryId,
      storeId,
      pageNumber,
      pageSize,
    });

    if (!productResult.success) {
      return NextResponse.json({ error: productResult.error }, { status: 500 });
    }

    const result = productResult.data;

    const data = result.data.map(product => ({
      id:           product.id,
      img:          product.img,
      storeId:      product.storeId,
      storeName:    product.storeName,
      categoryId:   product.categoryId,
      categoryName: product.categoryName,
      name:         product.name,
      price:        Number(product.price),
      stock:        product.stock,
      weight:       Number(product.weight),
      available:    product.available,
    }));

    return NextResponse.json({
      data,
      total:      result.total,
      page:       result.page,
      pageSize:   result.pageSize,
      totalPages: result.totalPages,
    });

  } catch (error) {
    console.error('[GET /api/admin/products]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
