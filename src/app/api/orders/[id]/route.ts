import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import { PrismaOrderRepository } from '../../../../infrastructure/repositories/prisma/PrismaOrderRepository';

const orderRepo = new PrismaOrderRepository();

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['READY', 'CANCELLED'],
  READY: ['ON_THE_WAY'],
  ON_THE_WAY: ['DELIVERED'],
};

async function triggerPayouts(
  order: { id: string; storeId: string; totalAmount: number },
  token: string
) {
  if (process.env.DEVELOPMENT) {
    console.log('[MOCK] Triggering payouts for order:', {
      orderId: order.id,
      recipientId: order.storeId,
      recipientType: 'SELLER',
      amount: order.totalAmount,
    });
    return;
  }

  const PAYMENTS_API = process.env.PAYMENTS_API_URL;

  await fetch(`${PAYMENTS_API}/api/payments/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      orderId: order.id,
      recipientId: order.storeId,
      recipientType: 'SELLER',
      amount: order.totalAmount,
    }),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'El campo status es requerido' }, { status: 400 });
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: `Estado inválido: ${status}` }, { status: 400 });
    }

    const currentOrder = await orderRepo.findById(id);

    if (!currentOrder) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const allowedTransitions = VALID_TRANSITIONS[currentOrder.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return NextResponse.json({
        error: `No se puede cambiar de ${currentOrder.status} a ${status}`,
      }, { status: 422 });
    }

    const updatedOrder = await orderRepo.updateStatus(id, status);

    if (status === 'DELIVERED') {
      const { getToken } = await auth();
      const token = await getToken();

      if (token) {
        await triggerPayouts({
          id: currentOrder.id,
          storeId: currentOrder.storeId,
          totalAmount: currentOrder.totalAmount.toNumber(),
        }, token);
      }
    }

    return NextResponse.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      updatedAt: updatedOrder.updatedAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error actualizando orden:', error);
    return NextResponse.json({ error: 'Error interno del servidor', message }, { status: 500 });
  }
}
