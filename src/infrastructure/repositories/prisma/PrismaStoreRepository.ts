import prisma from '../../db/prisma';
import { IStoreRepository } from '../../../core/repositories/IStoreRepository';
import { Store } from '@prisma/client';

export class PrismaStoreRepository implements IStoreRepository {
  async findAll(): Promise<Store[]> {
    return prisma.store.findMany();
  }

  async findById(id: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { id } });
  }

  async findBySellerId(sellerId: string): Promise<Store | null> {
    return prisma.store.findFirst({
      where: {
        sellers: {
          some: {
            id: sellerId
          }
        }
      }
    });
  }

  async create(data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> {
    return prisma.store.create({ data });
  }

  async update(id: string, data: Partial<Store>): Promise<Store> {
    return prisma.store.update({ where: { id }, data });
  }
}
