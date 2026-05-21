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

// Extiende CreateOrderInput con la cantidad original para poder
// descontar el stock de cada producto en la misma transacción.
export type CreateOrderWithStockInput = CreateOrderInput & {
  itemsWithQuantity: {
    productId: string;
    quantity: number;
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

export type PaginatedOrders = {
  data: SellerOrderView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

export type PaginatedAdminOrders = {
  data: (Order & { store: { name: string } | null })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export interface IOrderRepository {
  findAll(page?: number, pageSize?: number): Promise<PaginatedAdminOrders>;
  findById(id: string): Promise<Order | null>;
  findByStore(storeId: string, page?: number, pageSize?: number, status?: string): Promise<PaginatedOrders>;
  findPendingsPaymentsByStore(storeId: string): Promise<SellerOrderView[]>;
  findReadyOrders(): Promise<ReadyOrderView[]>;
  createWithItemsAndUpdateStock(data: CreateOrderWithStockInput): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
