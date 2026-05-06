import prisma from '../../db/prisma';
import { IProductRepository } from '../../../core/repositories/IProductRepository';
import { Product } from '@prisma/client';

export class PrismaProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async findByStore(storeId: string): Promise<Product[]> {
    return prisma.product.findMany({ where: { storeId } });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return prisma.product.findMany({ where: { categoryId } });
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return prisma.product.create({ data });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
