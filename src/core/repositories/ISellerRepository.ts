import { Seller } from '@prisma/client';
import { ActionResult } from '../../types/action-result';

export interface ISellerRepository {
  findById(id: string): Promise<ActionResult<Seller | null>>;
  create(data: Omit<Seller, 'createdAt' | 'updatedAt'>): Promise<ActionResult<Seller>>;
  update(id: string, data: Partial<Seller>): Promise<ActionResult<Seller>>;
  delete(id: string): Promise<ActionResult<void>>;
}
