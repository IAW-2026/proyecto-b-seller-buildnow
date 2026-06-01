import prisma from '../../db/prisma';
import { IOrderRepository, CreateOrderInput, PaginatedOrders, ReadyOrderView, SellerOrderView, PaginatedAdminOrders } from '../../../core/repositories/IOrderRepository';
import { Order, OrderStatus } from '@prisma/client';
import { ActionResult } from '../../../types/action-result';

const MINUTOS_TO_WAIT_BEFORE_DELETE = 20;

export class PrismaOrderRepository implements IOrderRepository {
  async findAll(page = 1, pageSize = 10, storeId?: string): Promise<ActionResult<PaginatedAdminOrders>> {
    try {
      const skip = (page - 1) * pageSize;
      const where = storeId ? { storeId } : {};

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            store: {
              select: { name: true }
            },
          },
          skip,
          take: pageSize,
        }),
        prisma.order.count({ where }),
      ]);

      return {
        success: true,
        data: {
          data: orders as any,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      };
    } catch (error) {
      console.error('[PrismaOrderRepository.findAll]', error);
      return { success: false, error: 'Error al obtener las órdenes' };
    }
  }

  async countAll(): Promise<ActionResult<number>> {
    try {
      const count = await prisma.order.count();
      return { success: true, data: count };
    } catch (error) {
      console.error('[PrismaOrderRepository.countAll]', error);
      return { success: false, error: 'Error al contar las órdenes' };
    }
  }

  async findById(id: string): Promise<ActionResult<Order | null>> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      return { success: true, data: order };
    } catch (error) {
      console.error('[PrismaOrderRepository.findById]', error);
      return { success: false, error: 'Error al buscar la orden' };
    }
  }

  private async expireStaleOrders(storeId: string): Promise<void> {
    const cutoff = new Date(Date.now() - MINUTOS_TO_WAIT_BEFORE_DELETE * 60 * 1000);

    const stale = await prisma.order.findMany({
      where: {
        storeId,
        status: OrderStatus.PENDING_PAYMENT,
        createdAt: { lt: cutoff },
      },
      include: { items: true },
    });

    if (stale.length === 0) return;

    const staleIds = stale.map((o) => o.id);

    const stockToRestore = new Map<string, number>();
    for (const order of stale) {
      for (const item of order.items) {
        const current = stockToRestore.get(item.productId) ?? 0;
        stockToRestore.set(item.productId, current + item.quantity);
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const [productId, quantity] of stockToRestore) {
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: { increment: quantity },
            available: true,
          },
        });
      }

      await tx.orderItem.deleteMany({ where: { orderId: { in: staleIds } } });
      await tx.order.deleteMany({ where: { id: { in: staleIds } } });
    });
  }

  async findByStore(storeId: string, page = 1, pageSize = 10, status?: string): Promise<ActionResult<PaginatedOrders>> {
    try {
      await this.expireStaleOrders(storeId);

      const skip = (page - 1) * pageSize;
      const where = {
        storeId,
        ...(status && status !== 'ALL' ? { status: status as OrderStatus } : {}),
      };

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.order.count({ where }),
      ]);

      return {
        success: true,
        data: {
          data: orders.map(order => ({
            id: order.id,
            buyerId: order.buyerId,
            status: order.status,
            totalAmount: Number(order.totalAmount),
            totalWeight: Number(order.totalWeight),
            deliveryAddress: order.deliveryAddress,
            items: order.items.map(item => ({
              id: item.id,
              productId: item.productId,
              productName: item.product.name,
              quantity: item.quantity,
              price: Number(item.price),
            })),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          })),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        }
      };
    } catch (error) {
      console.error('[PrismaOrderRepository.findByStore]', error);
      return { success: false, error: 'Error al obtener las órdenes de la tienda' };
    }
  }

  async findPendingsPaymentsByStore(storeId: string): Promise<ActionResult<SellerOrderView[]>> {
    try {
      await this.expireStaleOrders(storeId);

      const orders = await prisma.order.findMany({
        where: {
          storeId,
          status: {
            in: [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED],
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: orders.map(order => ({
          id: order.id,
          buyerId: order.buyerId,
          status: order.status,
          totalAmount: Number(order.totalAmount),
          totalWeight: Number(order.totalWeight),
          deliveryAddress: order.deliveryAddress,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        }))
      };
    } catch (error) {
      console.error('[PrismaOrderRepository.findPendingsPaymentsByStore]', error);
      return { success: false, error: 'Error al buscar órdenes pendientes' };
    }
  }

  async findReadyOrders(): Promise<ActionResult<ReadyOrderView[]>> {
    try {
      const orders = await prisma.order.findMany({
        where: { status: OrderStatus.READY },
        include: {
          store: true,
          items: true,
        },
      });

      return {
        success: true,
        data: orders.map(order => ({
          id: order.id,
          storeName: order.store.name,
          storeAddress: order.store.address,
          deliveryAddress: order.deliveryAddress,
          totalWeight: Number(order.totalWeight),
          totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
          createdAt: order.createdAt.toISOString(),
        }))
      };
    } catch (error) {
      console.error('[PrismaOrderRepository.findReadyOrders]', error);
      return { success: false, error: 'Error al obtener las órdenes listas' };
    }
  }

  async createWithItemsAndUpdateStock(data: CreateOrderInput): Promise<ActionResult<Order>> {
    try {
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            buyerId: data.buyerId,
            storeId: data.storeId,
            deliveryAddress: data.deliveryAddress,
            totalAmount: data.totalAmount,
            totalWeight: data.totalWeight,
            status: 'PENDING_PAYMENT',
            items: {
              create: data.items,
            },
          },
        });

        await Promise.all(
          data.items.map(({ productId, quantity }) =>
            tx.product.update({
              where: { id: productId },
              data: { stock: { decrement: quantity } },
            }).then((updated) =>
              updated.stock <= 0
                ? tx.product.update({
                  where: { id: productId },
                  data: { available: false },
                })
                : Promise.resolve(updated)
            )
          )
        );

        return newOrder;
      });

      return { success: true, data: order };
    } catch (error) {
      console.error('[PrismaOrderRepository.createWithItemsAndUpdateStock]', error);
      return { success: false, error: 'Error al crear la orden y actualizar el stock' };
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<ActionResult<Order>> {
    try {
      const order = await prisma.order.update({
        where: { id },
        data: { status },
      });
      return { success: true, data: order };
    } catch (error) {
      console.error('[PrismaOrderRepository.updateStatus]', error);
      return { success: false, error: 'Error al actualizar el estado de la orden' };
    }
  }
}
