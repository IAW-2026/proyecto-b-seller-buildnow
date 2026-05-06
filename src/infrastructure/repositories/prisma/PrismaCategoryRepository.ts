import prisma from '../../db/prisma';
import { ICategoryRepository } from '../../../core/repositories/ICategoryRepository';
import { Category } from '@prisma/client';

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}
