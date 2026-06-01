import { Store, StoreStatus } from '@prisma/client';
import { ActionResult } from '../../types/action-result';

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
  findAll(): Promise<ActionResult<Store[]>>;
  countByStatus(statuses: StoreStatus[]): Promise<ActionResult<number>>;
  findPaginated(options: SearchStoresOptions): Promise<ActionResult<PaginatedStores>>;
  findById(id: string): Promise<ActionResult<Store | null>>;
  findBySellerId(sellerId: string): Promise<ActionResult<Store | null>>;
  create(data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<Store>>;
  update(id: string, data: Partial<Store>): Promise<ActionResult<Store>>;
}
