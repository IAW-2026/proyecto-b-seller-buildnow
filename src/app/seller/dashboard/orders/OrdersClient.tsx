'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SellerOrderView } from '@/core/repositories/IOrderRepository';
import { OrderStatus } from '@prisma/client';
import { ShoppingCart, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { updateOrderStatusAction } from '@/app/actions/order.actions';
import { FILTER_TABS } from './order.constants';
import { OrderRow } from './OrderRow';
import { OrderDetailModal } from './OrderDetailModal';

interface OrdersClientProps {
  orders: SellerOrderView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  activeStatus: string;
}

export function OrdersClient({
  orders,
  total,
  page,
  pageSize,
  totalPages,
  activeStatus,
}: OrdersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedOrder, setSelectedOrder] = useState<SellerOrderView | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function navigate(newPage: number, newStatus?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    if (newStatus !== undefined) {
      if (newStatus === 'ALL') {
        params.delete('status');
      } else {
        params.set('status', newStatus);
      }
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleFilterChange(status: string) {
    navigate(1, status);
  }

  const handleMarkReady = async (orderId: string) => {
    setLoadingOrderId(orderId);
    setError(null);
    try {
      await updateOrderStatusAction(orderId, OrderStatus.READY);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la orden');
    } finally {
      setLoadingOrderId(null);
    }
  };

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            Órdenes
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Gestioná los pedidos de tu corralón. Marcá las órdenes confirmadas como listas cuando estén armadas.
          </p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-zinc-500 font-medium">Filtrar por estado</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-sm uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Referencia</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Monto</th>
                <th className="px-6 py-4 font-medium">Dirección</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-zinc-100 mb-3">
                        <ShoppingCart className="text-zinc-400" size={24} />
                      </div>
                      <p className="text-zinc-900 font-medium">No hay órdenes</p>
                      <p className="text-zinc-500 text-sm mt-1">
                        {activeStatus === 'ALL'
                          ? 'Tu corralón aún no recibió pedidos.'
                          : `No hay órdenes con el estado "${FILTER_TABS.find(t => t.key === activeStatus)?.label}".`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}

              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isLoading={loadingOrderId === order.id}
                  onViewDetail={setSelectedOrder}
                  onMarkReady={handleMarkReady}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
            <p className="text-sm text-zinc-500">
              Mostrando <span className="font-medium text-zinc-700">{start}–{end}</span> de{' '}
              <span className="font-medium text-zinc-700">{total}</span> órdenes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="text-sm text-zinc-500 px-2">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => navigate(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Orden #${selectedOrder?.id.substring(0, 8).toUpperCase() || ''}`}
      >
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            isMarkingReady={loadingOrderId === selectedOrder.id}
            onMarkReady={handleMarkReady}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
