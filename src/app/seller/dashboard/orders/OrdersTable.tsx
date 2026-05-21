'use client';

import { ShoppingCart } from 'lucide-react';
import { SellerOrderView } from '@/core/repositories/IOrderRepository';
import { Pagination } from '@/components/ui/Pagination';
import { FILTER_TABS } from './order.constants';
import { OrderRow } from './OrderRow';

interface OrdersTableProps {
  orders: SellerOrderView[];
  activeStatus: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  loadingOrderId: string | null;
  onViewDetail: (order: SellerOrderView) => void;
  onMarkReady: (orderId: string) => void;
  onPageChange: (page: number) => void;
}

export function OrdersTable({
  orders,
  activeStatus,
  page,
  totalPages,
  total,
  pageSize,
  loadingOrderId,
  onViewDetail,
  onMarkReady,
  onPageChange,
}: OrdersTableProps) {
  return (
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
                onViewDetail={onViewDetail}
                onMarkReady={onMarkReady}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
