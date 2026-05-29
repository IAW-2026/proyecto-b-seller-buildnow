import { NextRequest, NextResponse } from 'next/server';
import { PrismaProductRepository } from '../../../infrastructure/repositories/prisma/PrismaProductRepository';

const productRepo = new PrismaProductRepository();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryID') || searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const pageNumberParam = searchParams.get('pageNumber');
    const pageSizeParam = searchParams.get('pageSize');

    const pageNumber = pageNumberParam ? parseInt(pageNumberParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    const productResult = await productRepo.findPaginated({
      categoryId,
      search,
      pageNumber,
      pageSize
    });
    if (!productResult.success) {
      return NextResponse.json({ error: productResult.error }, { status: 500 });
    }
    const result = productResult.data;

    const data = result.data.map(product => ({
      id: product.id,
      img: product.img,
      storeId: product.storeId,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      weight: Number(product.weight),
      available: product.available,
    }));

    return NextResponse.json({
      data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
