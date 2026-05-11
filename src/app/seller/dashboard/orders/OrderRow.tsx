import { SellerOrderView } from '@/core/repositories/IOrderRepository';
import { Eye, PackageCheck } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatDate } from './order.constants';

interface OrderRowProps {
  order: SellerOrderView;
  isLoading: boolean;
  onViewDetail: (order: SellerOrderView) => void;
  onMarkReady: (orderId: string) => void;
}

export function OrderRow({ order, isLoading, onViewDetail, onMarkReady }: OrderRowProps) {
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <tr className="hover:bg-zinc-50/50 transition-colors">
      {/* Referencia */}
      <td className="px-6 py-4">
        <span className="font-mono text-sm text-zinc-900">
          #{order.id.substring(0, 8).toUpperCase()}
        </span>
      </td>

      {/* Estado */}
      <td className="px-6 py-4">
        <OrderStatusBadge status={order.status} />
      </td>

      {/* Items */}
      <td className="px-6 py-4">
        <span className="text-sm text-zinc-600">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </td>

      {/* Monto */}
      <td className="px-6 py-4">
        <span className="font-medium text-orange-500">
          ${order.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </td>

      {/* Dirección */}
      <td className="px-6 py-4">
        <span className="text-sm text-zinc-500 truncate max-w-[200px] block" title={order.deliveryAddress}>
          {order.deliveryAddress.length > 35
            ? order.deliveryAddress.substring(0, 35) + '...'
            : order.deliveryAddress}
        </span>
      </td>

      {/* Fecha */}
      <td className="px-6 py-4">
        <span className="text-sm text-zinc-500">
          {formatDate(order.createdAt)}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Botón Ver Detalle */}
          <button
            onClick={() => onViewDetail(order)}
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Acción contextual: solo CONFIRMED → READY */}
          {order.status === 'CONFIRMED' && (
            <button
              onClick={() => onMarkReady(order.id)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              {isLoading ? 'Procesando...' : 'Marcar Listo'}
            </button>
          )}

          {/* Indicadores informativos para otros estados */}
          {order.status === 'PENDING_PAYMENT' && (
            <span className="text-xs text-amber-500/70 italic">
              Esperando pago
            </span>
          )}
          {order.status === 'READY' && (
            <span className="text-xs text-green-500/70 italic">
              Esperando delivery
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
