import { Store, StoreStatus } from '@prisma/client';

export interface SearchStoresOptions {
  pageNumber: number;
  pageSize: number;
  isAdmin?: boolean;
}

export interface PaginatedStores {
  data: Store[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IStoreRepository {
  findAll(): Promise<Store[]>;
  countByStatus(statuses: StoreStatus[]): Promise<number>;
  findPaginated(options: SearchStoresOptions): Promise<PaginatedStores>;
  findById(id: string): Promise<Store | null>;
  findBySellerId(sellerId: string): Promise<Store | null>;
  create(data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store>;
  update(id: string, data: Partial<Store>): Promise<Store>;
}
