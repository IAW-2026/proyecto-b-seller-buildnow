import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';
import { getPeriodFrom } from '../utils';

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const period = request.nextUrl.searchParams.get('period');
    const from = getPeriodFrom(period);

    const items = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: from } } },
      select: {
        quantity: true,
        product: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
    });

    // Aggregate quantities per category
    const categoryMap = new Map<string, number>();
    let totalQuantity = 0;

    for (const item of items) {
      const categoryName = item.product.category.name;
      const current = categoryMap.get(categoryName) ?? 0;
      categoryMap.set(categoryName, current + item.quantity);
      totalQuantity += item.quantity;
    }

    const data = Array.from(categoryMap.entries())
      .map(([name, qty]) => ({
        name,
        percentage:
          totalQuantity > 0 ? Math.round((qty / totalQuantity) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Analytics] category-sales error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
