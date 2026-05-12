import prisma from '../../db/prisma';
import { IOrderRepository, CreateOrderInput, ReadyOrderView, SellerOrderView } from '../../../core/repositories/IOrderRepository';
import { Order, OrderStatus } from '@prisma/client';

export class PrismaOrderRepository implements IOrderRepository {
  async findAll(): Promise<Order[]> {
    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: true,
      }
    });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByStore(storeId: string): Promise<SellerOrderView[]> {
    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
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
    }));
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
