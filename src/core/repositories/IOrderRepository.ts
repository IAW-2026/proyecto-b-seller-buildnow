import { Order, OrderStatus } from '@prisma/client';

export type CreateOrderInput = {
  buyerId: string;
  storeId: string;
  deliveryAddress: string;
  totalAmount: number;
  totalWeight: number;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
};

export type OrderItemDetail = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type SellerOrderView = {
  id: string;
  buyerId: string;
  status: OrderStatus;
  totalAmount: number;
  totalWeight: number;
  deliveryAddress: string;
  items: OrderItemDetail[];
  createdAt: string;
  updatedAt: string;
};

export type ReadyOrderView = {
  id: string;
  storeName: string;
  storeAddress: string;
  deliveryAddress: string;
  totalWeight: number;
  totalItems: number;
  createdAt: string;
};

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByStore(storeId: string): Promise<SellerOrderView[]>;
  findReadyOrders(): Promise<ReadyOrderView[]>;
  createWithItems(data: CreateOrderInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;

}
