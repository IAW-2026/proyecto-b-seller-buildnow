'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { OrderStatus } from '@prisma/client';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import type { ActionResult } from '@/types/action-result';

const SELLER_TRANSITIONS: Record<string, OrderStatus[]> = {
  CONFIRMED: [OrderStatus.READY],
};

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus): Promise<ActionResult> {
  const roleCheck = await requireRole([APP_ROLES.SELLER]);
  if (!roleCheck.success) return roleCheck;

  const sellerCtx = await getSellerContext();
  if (!sellerCtx.success) return sellerCtx;
  const { seller } = sellerCtx.data;

  const orderRepo = new PrismaOrderRepository();
  const order = await orderRepo.findById(orderId);

  if (!order) {
    return { success: false, error: 'Orden no encontrada' };
  }

  if (order.storeId !== seller.storeId) {
    return { success: false, error: 'No tenés permisos para modificar esta orden' };
  }

  const allowedTransitions = SELLER_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return {
      success: false,
      error: `No se puede cambiar el estado de ${order.status} a ${newStatus}`,
    };
  }

  await orderRepo.updateStatus(orderId, newStatus);

  revalidatePath('/seller/dashboard/orders');
  revalidatePath('/seller/dashboard');
  return { success: true };
}
