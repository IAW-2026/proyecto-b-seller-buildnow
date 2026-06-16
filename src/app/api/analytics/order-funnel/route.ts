import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';
import { getPeriodFrom } from '../utils';

const FUNNEL_ORDER: OrderStatus[] = [
  'PENDING_PAYMENT',
  'CONFIRMED',
  'READY',
  'ON_THE_WAY',
  'DELIVERED',
  'CANCELLED',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Recibidas',
  CONFIRMED: 'Confirmadas',
  READY: 'Listas',
  ON_THE_WAY: 'En camino',
  DELIVERED: 'Entregadas',
  CANCELLED: 'Canceladas',
};

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const period = request.nextUrl.searchParams.get('period');
    const from = getPeriodFrom(period);

    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { createdAt: { gte: from } },
    });

    const countMap = new Map<OrderStatus, number>(
      counts.map((c) => [c.status, c._count.id])
    );

    // Total = all orders in the period (use PENDING_PAYMENT as top of funnel, or real total)
    const total = counts.reduce((sum, c) => sum + c._count.id, 0);

    const data = FUNNEL_ORDER.map((status) => {
      const count = countMap.get(status) ?? 0;
      return {
        status: STATUS_LABELS[status],
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Analytics] order-funnel error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
