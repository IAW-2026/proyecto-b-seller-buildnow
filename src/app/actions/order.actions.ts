'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { OrderStatus } from '@prisma/client';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';

const SELLER_TRANSITIONS: Record<string, OrderStatus[]> = {
  CONFIRMED: [OrderStatus.READY],
};

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus) {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const orderRepo = new PrismaOrderRepository();
  const order = await orderRepo.findById(orderId);

  if (!order) {
    throw new Error('Orden no encontrada');
  }

  if (order.storeId !== seller.storeId) {
    throw new Error('No tenés permisos para modificar esta orden');
  }

  const allowedTransitions = SELLER_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    throw new Error(
      `No se puede cambiar el estado de ${order.status} a ${newStatus}`
    );
  }

  await orderRepo.updateStatus(orderId, newStatus);

  revalidatePath('/seller/dashboard/orders');
  revalidatePath('/seller/dashboard');
}
