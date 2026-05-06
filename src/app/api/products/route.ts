import { NextRequest, NextResponse } from 'next/server';
import { PrismaProductRepository } from '../../../infrastructure/repositories/prisma/PrismaProductRepository';

const productRepo = new PrismaProductRepository();

export async function GET(request: NextRequest) {
  try {
    const categoryId = request.nextUrl.searchParams.get('categoryId');

    const products = await productRepo.findAll(categoryId || undefined);

    const response = products.map(product => ({
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
