import { Product } from '@prisma/client';
import { ActionResult } from '../../types/action-result';

export type ProductWithCategory = Product & {
  categoryName: string;
  storeName?: string;
};

export interface SearchProductsOptions {
  categoryId?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
}

export interface SearchStoreProductsOptions extends SearchProductsOptions {
  storeId: string;
}

export interface SearchAdminProductsOptions {
  storeId?: string;
  categoryId?: string;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedProducts {
  data: ProductWithCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IProductRepository {
  findById(id: string): Promise<ActionResult<Product | null>>;
  findByIdWithCategory(id: string): Promise<ActionResult<ProductWithCategory | null>>;
  findByStore(storeId: string): Promise<ActionResult<ProductWithCategory[]>>;
  findAll(categoryId?: string): Promise<ActionResult<ProductWithCategory[]>>;
  countAll(): Promise<ActionResult<number>>;
  findPaginated(options: SearchProductsOptions): Promise<ActionResult<PaginatedProducts>>;
  findPaginatedByStore(options: SearchStoreProductsOptions): Promise<ActionResult<PaginatedProducts>>;
  findPaginatedForAdmin(options: SearchAdminProductsOptions): Promise<ActionResult<PaginatedProducts>>;
  findManyByIds(ids: string[]): Promise<ActionResult<Product[]>>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<Product>>;
  update(id: string, data: Partial<Product>): Promise<ActionResult<Product>>;
  delete(id: string): Promise<ActionResult<void>>;
}
