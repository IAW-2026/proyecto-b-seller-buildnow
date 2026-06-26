import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';

function getPeriodDates(period: string | null): { from: Date; previousFrom: Date } {
  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[period ?? '7d'] ?? 7;
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousFrom = new Date(from.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, previousFrom };
}

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const period = request.nextUrl.searchParams.get('period');
    const { from, previousFrom } = getPeriodDates(period);

    const [
      totalStores,
      activeStores,
      currentOrders,
      previousOrders,
      currentRevenue,
      previousRevenue,
      totalSellers,
      unassignedSellers,
    ] = await Promise.all([
      prisma.store.count(),
      prisma.store.count({ where: { status: 'OPEN' } }),
      prisma.order.count({ where: { createdAt: { gte: from } } }),
      prisma.order.count({ where: { createdAt: { gte: previousFrom, lt: from } } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: from } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: previousFrom, lt: from } },
      }),
      prisma.seller.count(),
      prisma.seller.count({ where: { storeId: null } }),
    ]);

    const currentRev = Number(currentRevenue._sum.totalAmount ?? 0);
    const previousRev = Number(previousRevenue._sum.totalAmount ?? 0);


    return NextResponse.json({
      activeStores: {
        current: activeStores,
        total: totalStores,
      },
      totalOrders: {
        current: currentOrders,
        previous: previousOrders
      },
      platformRevenue: {
        current: currentRev,
        previous: previousRev
      },
      registeredSellers: {
        current: totalSellers,
        unassigned: unassignedSellers,
      },
    });
  } catch (error) {
    console.error('[Analytics] platform-summary error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
