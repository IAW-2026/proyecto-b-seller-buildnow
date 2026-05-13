import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@prisma/client';
import { PrismaOrderRepository } from '../../../infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '../../../infrastructure/repositories/prisma/PrismaProductRepository';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';

const orderRepo = new PrismaOrderRepository();
const productRepo = new PrismaProductRepository();

type ItemInput = { productId: string; quantity: number };


export async function GET(request: NextRequest) {
  try {

    await requireRole([APP_ROLES.DELIVERY]);

    const status = request.nextUrl.searchParams.get('status');

    if (status === 'READY') {
      const orders = await orderRepo.findReadyOrders();
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: 'Parámetro status requerido' }, { status: 400 });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


function calcularTotalesYArmarItems(items: ItemInput[], products: Product[]) {
  let totalAmount = 0;
  let totalWeight = 0;

  const orderItems = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

    if (product.stock < item.quantity) {
      throw new Error(`Producto ${product.name} no tiene stock suficiente`);
    }

    totalAmount += Number(product.price) * item.quantity;
    totalWeight += Number(product.weight) * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      price: Number(product.price),
    };
  });

  return { totalAmount, totalWeight, orderItems };
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([APP_ROLES.BUYER]);

    const body = await request.json();
    const { buyerId, storeId, deliveryAddress, items } = body;

    if (!buyerId || !storeId || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const productIds = items.map((item: ItemInput) => item.productId);
    const products = await productRepo.findManyByIds(productIds);

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Uno o más productos no encontrados' }, { status: 404 });
    }

    const { totalAmount, totalWeight, orderItems } = calcularTotalesYArmarItems(items, products);

    const order = await orderRepo.createWithItemsAndUpdateStock({
      buyerId,
      storeId,
      deliveryAddress,
      totalAmount,
      totalWeight,
      items: orderItems,
      itemsWithQuantity: items.map((item: ItemInput) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({
      id: order.id,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando orden:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({
      error: 'Error interno del servidor',
      message
    }, { status: 500 });
  }
}
