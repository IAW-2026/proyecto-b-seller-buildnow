import { Store } from '@prisma/client';

export interface IStoreRepository {
  findAll(): Promise<Store[]>;
  findById(id: string): Promise<Store | null>;
  findBySellerId(sellerId: string): Promise<Store | null>;
  create(data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store>;
  update(id: string, data: Partial<Store>): Promise<Store>;
}
