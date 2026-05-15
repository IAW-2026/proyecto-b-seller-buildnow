import { Product } from '@prisma/client';

export type ProductWithCategory = Product & {
  categoryName: string;
};

export interface SearchProductsOptions {
  categoryId?: string;
  search?: string;
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
  findById(id: string): Promise<Product | null>;
  findByIdWithCategory(id: string): Promise<ProductWithCategory | null>;
  findByStore(storeId: string): Promise<ProductWithCategory[]>;
  findByCategory(categoryId: string): Promise<ProductWithCategory[]>;
  findAll(categoryId?: string): Promise<ProductWithCategory[]>;
  findPaginated(options: SearchProductsOptions): Promise<PaginatedProducts>;
  findManyByIds(ids: string[]): Promise<Product[]>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
