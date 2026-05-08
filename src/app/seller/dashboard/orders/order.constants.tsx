import { OrderStatus } from '@prisma/client';
import { Clock, CheckCircle2, PackageCheck, Truck, XCircle } from 'lucide-react';
import React from 'react';

export type StatusConfig = {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
};

export const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING_PAYMENT: {
    label: 'Pago Pendiente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  CONFIRMED: {
    label: 'Confirmada',
    color: 'text-blue-700',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  READY: {
    label: 'Lista',
    color: 'text-green-700',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <PackageCheck className="w-3.5 h-3.5" />,
  },
  ON_THE_WAY: {
    label: 'En Camino',
    color: 'text-purple-700',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  DELIVERED: {
    label: 'Entregada',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'text-red-700',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export const FILTER_TABS: { key: 'ALL' | OrderStatus; label: string }[] = [
  { key: 'ALL', label: 'Todas' },
  { key: 'PENDING_PAYMENT', label: 'Pago Pendiente' },
  { key: 'CONFIRMED', label: 'Confirmadas' },
  { key: 'READY', label: 'Listas' },
  { key: 'ON_THE_WAY', label: 'En Camino' },
  { key: 'DELIVERED', label: 'Entregadas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
