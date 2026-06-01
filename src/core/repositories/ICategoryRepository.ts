import { Category } from '@prisma/client';
import { ActionResult } from '../../types/action-result';

export interface ICategoryRepository {
  findAll(): Promise<ActionResult<Category[]>>;
  findById(id: string): Promise<ActionResult<Category | null>>;
  create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<Category>>;
  update(id: string, data: Partial<Category>): Promise<ActionResult<Category>>;
  delete(id: string): Promise<ActionResult<void>>;
}
