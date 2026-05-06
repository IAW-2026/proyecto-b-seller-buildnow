import { Product } from '@prisma/client';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByStore(storeId: string): Promise<Product[]>;
  findByCategory(categoryId: string): Promise<Product[]>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
