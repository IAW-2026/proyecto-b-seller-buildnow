import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OrderStatus } from '@prisma/client';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';
import { getPeriodFrom } from '../utils';

const STATUS_NAMES: Record<OrderStatus, string> = {
  DELIVERED: 'Delivered',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  READY: 'Ready',
  ON_THE_WAY: 'On the way',
  PENDING_PAYMENT: 'Pending payment',
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

    const data = counts
      .map((c) => ({
        name: STATUS_NAMES[c.status],
        value: c._count.id,
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Analytics] status-donut error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
