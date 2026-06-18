import { Order, OrderStatus } from '@prisma/client';
import { ActionResult } from '../../types/action-result';

export type BuyerOrderView = {
  id: string;
  buyerId: string;
  storeId: string;
  storeName: string;
  totalAmount: number;
  totalWeight: number;
  status: OrderStatus;
  deliveryAddress: string;
  items: OrderItemDetail[];
  createdAt: string;
};

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

export type OrderTrackingDetail = {
  orderId: string;
  storeName: string;
  itemsOrders: OrderItemDetail[];
  pesoTotal: number;
  precioTotal: number;
  estadoDelPedido: OrderStatus;
  createdAt: string;
};


export interface IOrderRepository {
  findAll(page?: number, pageSize?: number, storeId?: string, status?: string): Promise<ActionResult<PaginatedAdminOrders>>;
  countAll(): Promise<ActionResult<number>>;
  findById(id: string): Promise<ActionResult<Order | null>>;
  findByStore(storeId: string, page?: number, pageSize?: number, status?: string): Promise<ActionResult<PaginatedOrders>>;
  findPendingsPaymentsByStore(storeId: string): Promise<ActionResult<SellerOrderView[]>>;
  findReadyOrders(): Promise<ActionResult<ReadyOrderView[]>>;
  createWithItemsAndUpdateStock(data: CreateOrderInput): Promise<ActionResult<Order>>;
  updateStatus(id: string, status: OrderStatus): Promise<ActionResult<Order>>;
  findTrackingDetails(id: string): Promise<ActionResult<OrderTrackingDetail | null>>;
  findByBuyer(buyerId: string): Promise<ActionResult<BuyerOrderView[]>>;
}
