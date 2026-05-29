import { NextResponse } from 'next/server';
import { PrismaProductRepository } from '../../../../../infrastructure/repositories/prisma/PrismaProductRepository';

const productRepo = new PrismaProductRepository();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    const productsResult = await productRepo.findByStore(storeId);
    if (!productsResult.success) {
      return NextResponse.json({ error: productsResult.error }, { status: 500 });
    }
    const products = productsResult.data;

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
    console.error('Error obteniendo productos de la tienda:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
