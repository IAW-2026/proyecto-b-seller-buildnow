import { NextResponse } from 'next/server';
import { PrismaProductRepository } from '../../../../infrastructure/repositories/prisma/PrismaProductRepository';

const productRepo = new PrismaProductRepository();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    const product = await productRepo.findByIdWithCategory(productId);

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const response = {
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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
