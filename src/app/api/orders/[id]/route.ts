import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import { OrderStatus } from '@prisma/client';
import { PrismaOrderRepository } from '../../../../infrastructure/repositories/prisma/PrismaOrderRepository';

const orderRepo = new PrismaOrderRepository();

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['READY', 'CANCELLED'],
  READY: ['ON_THE_WAY'],
  ON_THE_WAY: ['DELIVERED'],
};


const ROLE_ALLOWED_STATUSES: Record<string, string[]> = {
  [APP_ROLES.DELIVERY]: ['ON_THE_WAY', 'DELIVERED'],
  [APP_ROLES.PAYMENTS]: ['CONFIRMED', 'CANCELLED'],
  [APP_ROLES.SELLER]: ['READY', 'CANCELLED'],
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'El campo status es requerido' }, { status: 400 });
    }
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: `Estado inválido: ${status}` }, { status: 400 });
    }

    if (process.env.SKIP_AUTH !== 'true') {
      const { userId, getToken } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }

      const authError = await authorizeStatusChange(userId, status);
      if (authError) {
        return NextResponse.json({ error: authError }, { status: 403 });
      }

      const currentOrder = await orderRepo.findById(id);
      if (!currentOrder) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
      }

      const transitionError = validateStatusTransition(currentOrder.status, status);
      if (transitionError) {
        return NextResponse.json({ error: transitionError }, { status: 422 });
      }
    }


    const updatedOrder = await orderRepo.updateStatus(id, status);

    if (process.env.SKIP_AUTH !== 'true') {
      if (status === 'DELIVERED') {
        const { getToken } = await auth();
        const token = await getToken();

        const currentOrder = await orderRepo.findById(id);
        if (!currentOrder) {
          return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
        }

        if (token) {
          await triggerPayouts(
            {
              id: currentOrder.id,
              storeId: currentOrder.storeId,
              totalAmount: currentOrder.totalAmount.toNumber(),
            },
            token,
          );
        }
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


export async function authorizeStatusChange(
  userId: string,
  nextStatus: string,
): Promise<string | null> {
  const isProduction = process.env.DEVELOPMENT !== 'true';
  if (!isProduction) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const role = user.publicMetadata?.role as string;

  if (role === APP_ROLES.ADMIN) return null;

  const allowedStatuses = ROLE_ALLOWED_STATUSES[role] ?? [];
  if (!allowedStatuses.includes(nextStatus)) {
    return `El rol ${role || 'desconocido'} no tiene permisos para cambiar el estado a ${nextStatus}`;
  }

  return null;
}

export function validateStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: string,
): string | null {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions?.includes(nextStatus)) {
    return `No se puede cambiar de ${currentStatus} a ${nextStatus}`;
  }

  return null;
}