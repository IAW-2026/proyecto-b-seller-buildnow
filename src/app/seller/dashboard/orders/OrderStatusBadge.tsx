import { OrderStatus } from '@prisma/client';
import { STATUS_CONFIG } from './order.constants';

export function OrderStatusBadge({ status, className = '' }: { status: OrderStatus, className?: string }) {
  const config = STATUS_CONFIG[status];
  
  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
