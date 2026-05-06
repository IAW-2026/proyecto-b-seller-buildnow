import prisma from '../../db/prisma';
import { IOrderRepository, CreateOrderInput, ReadyOrderView } from '../../../core/repositories/IOrderRepository';
import { Order, OrderStatus } from '@prisma/client';

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByStore(storeId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReadyOrders(): Promise<ReadyOrderView[]> {
    const orders = await prisma.order.findMany({
      where: { status: OrderStatus.READY },
      include: {
        store: true,
        items: true,
      },
    });

    return orders.map(order => ({
      id: order.id,
      storeName: order.store.name,
      storeAddress: order.store.address,
      deliveryAddress: order.deliveryAddress,
      totalWeight: Number(order.totalWeight),
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
    }));
  }

  async createWithItems(data: CreateOrderInput): Promise<Order> {
    return prisma.order.create({
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
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
