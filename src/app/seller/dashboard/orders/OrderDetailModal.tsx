import { SellerOrderView } from '@/core/repositories/IOrderRepository';
import { PackageCheck } from 'lucide-react';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailModalProps {
  order: SellerOrderView;
  isMarkingReady: boolean;
  onMarkReady: (orderId: string) => void;
  onClose: () => void;
}

export function OrderDetailModal({ order, isMarkingReady, onMarkReady, onClose }: OrderDetailModalProps) {
  return (
    <div className="space-y-5">
      {/* Estado actual */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-500">Estado:</span>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Dirección de entrega */}
      <div>
        <span className="text-sm text-zinc-500 block mb-1">Dirección de entrega</span>
        <p className="text-zinc-900 text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
          {order.deliveryAddress}
        </p>
      </div>

      {/* Lista de items */}
      <div>
        <span className="text-sm text-zinc-500 block mb-2">Productos</span>
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200">
              <tr className="text-zinc-500 text-xs uppercase">
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-center">Cant.</th>
                <th className="px-3 py-2 text-right">P. Unit.</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2.5 text-zinc-900">{item.productName}</td>
                  <td className="px-3 py-2.5 text-center text-zinc-600">{item.quantity}</td>
                  <td className="px-3 py-2.5 text-right text-zinc-600">
                    ${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2.5 text-right text-orange-400 font-medium">
                    ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Peso total</span>
          <span className="text-zinc-900">{order.totalWeight.toFixed(2)} kg</span>
        </div>
        <div className="flex justify-between text-sm border-t border-zinc-200 pt-2">
          <span className="text-zinc-600 font-medium">Monto total</span>
          <span className="text-orange-500 font-bold text-base">
            ${order.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Fechas */}
      <div className="flex justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-200">
        <span suppressHydrationWarning >Creada: {new Date(order.createdAt).toLocaleString('es-AR')}</span>
        <span suppressHydrationWarning >Actualizada: {new Date(order.updatedAt).toLocaleString('es-AR')}</span>
      </div>

      {/* Acción desde el modal */}
      {order.status === 'CONFIRMED' && (
        <div className="pt-3 border-t border-zinc-200">
          <button
            onClick={() => {
              onMarkReady(order.id);
              onClose();
            }}
            disabled={isMarkingReady}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            Marcar como Listo para Despacho
          </button>
        </div>
      )}
    </div>
  );
}
