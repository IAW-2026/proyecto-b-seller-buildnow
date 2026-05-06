import { Order } from '@prisma/client';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByStore(storeId: string): Promise<Order[]>;
  findReadyOrders(): Promise<Order[]>;
  create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateStatus(id: string, status: any): Promise<Order>;
}
