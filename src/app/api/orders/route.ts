import { NextRequest, NextResponse } from 'next/server';
import { Product, StoreStatus } from '@prisma/client';
import { PrismaOrderRepository } from '../../../infrastructure/repositories/prisma/PrismaOrderRepository';
import { PrismaProductRepository } from '../../../infrastructure/repositories/prisma/PrismaProductRepository';
import { PrismaStoreRepository } from '../../../infrastructure/repositories/prisma/PrismaStoreRepository';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { auth } from '@clerk/nextjs/server';

const orderRepo = new PrismaOrderRepository();
const productRepo = new PrismaProductRepository();
const storeRepo = new PrismaStoreRepository();

type ItemInput = { productId: string; quantity: number };


export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string;

    if (!role || (role !== APP_ROLES.BUYER && role !== APP_ROLES.DELIVERY)) {
      return NextResponse.json({ error: 'Tu rol no tiene permisos para realizar esta acción' }, { status: 403 });
    }

    if (role === APP_ROLES.BUYER) {
      return await manejoBuyer(request);
    }

    if (role === APP_ROLES.DELIVERY) {
      return await manejoDelivery(request);
    }
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function manejoBuyer(request: NextRequest) {
  const buyerId = request.nextUrl.searchParams.get('buyerId');

  if (!buyerId) {
    return NextResponse.json({ error: 'Parámetro buyerId requerido' }, { status: 400 });
  }

  const result = await orderRepo.findByBuyer(buyerId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
}

async function manejoDelivery(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status');

  if (status === 'READY') {
    const result = await orderRepo.findReadyOrders();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data);
  }

  return NextResponse.json({ error: 'Parámetro status requerido' }, { status: 400 });
}


function calcularTotalesYArmarItems(items: ItemInput[], productsMap: Map<string, Product>, storeId: string) {
  let totalAmount = 0;
  let totalWeight = 0;

  const orderItems = items.map(item => {
    const product = productsMap.get(item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

    if (product.storeId !== storeId) {
      throw new Error(`El producto "${product.name}" no pertenece a la tienda proveída`);
    }

    if (!product.available) {
      throw new Error(`El producto "${product.name}" no está disponible`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para "${product.name}"`);
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

async function verificarTienda(storeId: string) {
  const storeResult = await storeRepo.findById(storeId);
  if (!storeResult.success) {
    return NextResponse.json({ error: 'Error al verificar la tienda' }, { status: 500 });
  }
  if (!storeResult.data) {
    return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
  }
  if (storeResult.data.status === StoreStatus.SUSPENDED) {
    return NextResponse.json(
      { error: 'Tienda suspendida, no se pueden crear ordenes con esta tienda' },
      { status: 403 }
    );
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([APP_ROLES.BUYER]);

    const body = await request.json();
    const { buyerId, storeId, deliveryAddress, items } = body;

    if (!buyerId || !storeId || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const errorResponse = await verificarTienda(storeId);
    if (errorResponse) return errorResponse;

    const productIds = items.map((item: ItemInput) => item.productId);
    const productsResult = await productRepo.findManyByIds(productIds);
    if (!productsResult.success) {
      return NextResponse.json({ error: productsResult.error }, { status: 500 });
    }
    const products = productsResult.data;

    const productsMap = new Map(products.map(p => [p.id, p]));

    const { totalAmount, totalWeight, orderItems } = calcularTotalesYArmarItems(items, productsMap, storeId);

    const orderResult = await orderRepo.createWithItemsAndUpdateStock({
      buyerId,
      storeId,
      deliveryAddress,
      totalAmount,
      totalWeight,
      items: orderItems
    });

    if (!orderResult.success) {
      return NextResponse.json({ error: orderResult.error }, { status: 500 });
    }
    const order = orderResult.data;

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
