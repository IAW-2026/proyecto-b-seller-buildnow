import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';

function getPeriodFrom(period: string | null): Date {
  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[period ?? '7d'] ?? 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

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

    const grouped = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { order: { createdAt: { gte: from } } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: TOP_N,
    });

    const productIds = grouped.map((g) => g.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const data = grouped.map((g, index) => ({
      rank: index + 1,
      name: productMap.get(g.productId) ?? 'Producto desconocido',
      sales: g._sum.quantity ?? 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Analytics] top-products error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
