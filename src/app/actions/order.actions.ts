'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { OrderStatus } from '@prisma/client';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';
import type { ActionResult } from '@/types/action-result';
import { auth } from '@clerk/nextjs/server';

const SELLER_TRANSITIONS: Record<string, OrderStatus[]> = {
  CONFIRMED: [OrderStatus.READY],
};

async function requestPayout(orderId: string, recipientId: string, amount: number) {
  const { getToken } = await auth();
  const token = await getToken();

  const apiUrl = process.env.PAYMENTS_API_URL || 'http://localhost:3000';

  const response = await fetch(`${apiUrl}/api/payments/payouts`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId,
      recipientType: 'SELLER',
    }),
  });

  if (!response.ok) {
    throw new Error('Error al solicitar el pago a la API de payments');
  }

  return response.json();
}

export async function updateOrderStatusAction(orderId: string, newStatus: OrderStatus): Promise<ActionResult> {
  const roleCheck = await requireRole([APP_ROLES.SELLER]);
  if (!roleCheck.success) return roleCheck;

  const sellerCtx = await getSellerContext();
  if (!sellerCtx.success) return sellerCtx;
  const { seller } = sellerCtx.data;

  const orderRepo = new PrismaOrderRepository();
  const orderResult = await orderRepo.findById(orderId);
  if (!orderResult.success) {
    return { success: false, error: orderResult.error };
  }
  const order = orderResult.data;

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

  const updateResult = await orderRepo.updateStatus(orderId, newStatus);
  if (!updateResult.success) {
    return { success: false, error: updateResult.error };
  }

  try {
    await requestPayout(order.id, seller.storeId!, Number(order.totalAmount));
  } catch (error) {
    console.error('Error requesting payout:', error);
  }

  revalidatePath('/seller/dashboard/orders');
  revalidatePath('/seller/dashboard');
  return { success: true, data: undefined };
}
