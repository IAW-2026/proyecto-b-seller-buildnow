import prisma from '../../db/prisma';
import { IOrderRepository } from '../../../core/repositories/IOrderRepository';
import { Order, OrderStatus } from '@prisma/client';

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ 
      where: { id },
      include: { items: true } 
    });
  }

  async findByStore(storeId: string): Promise<Order[]> {
    return prisma.order.findMany({ 
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findReadyOrders(): Promise<Order[]> {
    return prisma.order.findMany({
      where: { status: OrderStatus.READY },
      include: { items: true }
    });
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return prisma.order.create({ data });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }
}
