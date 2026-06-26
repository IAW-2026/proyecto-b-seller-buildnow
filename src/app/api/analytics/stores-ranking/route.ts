import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StoreStatus } from '@prisma/client';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';
import { getPeriodFrom } from '../utils';

const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  OPEN: 'Abierta',
  CLOSE: 'Cerrada',
  SUSPENDED: 'Cerrada',
};

const TOP_N = 5;

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const period = request.nextUrl.searchParams.get('period');
    const from = getPeriodFrom(period);

    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        orders: {
          where: { createdAt: { gte: from } },
          select: { totalAmount: true },
        },
      },
    });

    const ranked = stores
      .map((store) => {
        const revenue = store.orders.reduce(
          (sum, o) => sum + Number(o.totalAmount),
          0
        );
        const orderCount = store.orders.length;
        const averageTicket =
          orderCount > 0 ? Math.round(revenue / orderCount) : 0;

        return {
          id: store.id,
          name: store.name,
          orders: orderCount,
          revenue: Math.round(revenue),
          averageTicket,
          status: STORE_STATUS_LABELS[store.status],
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, TOP_N)
      .map((store, index) => ({ rank: index + 1, ...store }));

    return NextResponse.json(ranked);
  } catch (error) {
    console.error('[Analytics] stores-ranking error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
