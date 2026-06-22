export function getPeriodFrom(period: string | null): Date {
  const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[period ?? '7d'] ?? 7;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
