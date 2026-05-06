import prisma from '../../db/prisma';
import { ISellerRepository } from '../../../core/repositories/ISellerRepository';
import { Seller } from '@prisma/client';

export class PrismaSellerRepository implements ISellerRepository {
  async findById(id: string): Promise<Seller | null> {
    return prisma.seller.findUnique({ where: { id } });
  }

  async create(data: Omit<Seller, 'createdAt' | 'updatedAt'>): Promise<Seller> {
    return prisma.seller.create({ data });
  }

  async update(id: string, data: Partial<Seller>): Promise<Seller> {
    return prisma.seller.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.seller.delete({ where: { id } });
  }
}
