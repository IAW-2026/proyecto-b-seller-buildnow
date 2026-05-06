import { Seller } from '@prisma/client';

export interface ISellerRepository {
  findById(id: string): Promise<Seller | null>;
  create(data: Omit<Seller, 'createdAt' | 'updatedAt'>): Promise<Seller>;
  update(id: string, data: Partial<Seller>): Promise<Seller>;
  delete(id: string): Promise<void>;
}
