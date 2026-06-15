import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import prisma from '@/infrastructure/db/prisma';

function getPeriodFrom(period: string | null): Date {
  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[period ?? '7d'] ?? 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

const DAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type TimeseriesEntry = { date: string; revenue: number; orders: number };

function buildTimeseries(
  orders: { createdAt: Date; totalAmount: unknown }[],
  period: string | null,
  from: Date
): TimeseriesEntry[] {
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const map = new Map<string, TimeseriesEntry>();

  // Pre-populate all buckets so missing days show as 0
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const key = getKey(d, period);
    if (!map.has(key)) {
      map.set(key, { date: getLabel(d, period, i), revenue: 0, orders: 0 });
    }
  }

  for (const order of orders) {
    const key = getKey(order.createdAt, period);
    const entry = map.get(key);
    if (entry) {
      entry.revenue += Number(order.totalAmount);
      entry.orders += 1;
    }
  }

  return Array.from(map.values());
}

function getKey(date: Date, period: string | null): string {
  if (period === '90d') {
    // Group by month + week-of-month
    return `${date.getFullYear()}-${date.getMonth()}-W${Math.ceil(date.getDate() / 7)}`;
  }
  // Group by calendar day (YYYY-MM-DD)
  return date.toISOString().slice(0, 10);
}

function getLabel(date: Date, period: string | null, dayIndex: number): string {
  if (period === '7d') {
    return DAY_LABELS_ES[date.getDay()];
  }
  if (period === '90d') {
    // Label by month name
    return date.toLocaleDateString('es-AR', { month: 'short' });
  }
  // 30d — DD/MM
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const period = request.nextUrl.searchParams.get('period');
    const from = getPeriodFrom(period);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const data = buildTimeseries(orders, period, from);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Analytics] revenue-timeseries error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
