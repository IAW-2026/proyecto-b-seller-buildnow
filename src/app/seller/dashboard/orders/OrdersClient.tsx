'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SellerOrderView } from '@/core/repositories/IOrderRepository';
import { OrderStatus } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { updateOrderStatusAction } from '@/app/actions/order.actions';
import toast from 'react-hot-toast';
import { OrderDetailModal } from './OrderDetailModal';
import { OrderFilters } from './OrderFilters';
import { OrdersTable } from './OrdersTable';

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
    try {
      await updateOrderStatusAction(orderId, OrderStatus.READY);
      toast.success('Orden marcada como lista exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar la orden');
    } finally {
      setLoadingOrderId(null);
    }
  };

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

      <OrderFilters
        activeStatus={activeStatus}
        onFilterChange={handleFilterChange}
      />

      <OrdersTable
        orders={orders}
        activeStatus={activeStatus}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        loadingOrderId={loadingOrderId}
        onViewDetail={setSelectedOrder}
        onMarkReady={handleMarkReady}
        onPageChange={newPage => navigate(newPage)}
      />

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
