import prisma from '../../db/prisma';
import { IStoreRepository, SearchStoresOptions, PaginatedStores } from '../../../core/repositories/IStoreRepository';
import { Store, StoreStatus, Prisma } from '@prisma/client';

export class PrismaStoreRepository implements IStoreRepository {
  async findAll(): Promise<Store[]> {
    return prisma.store.findMany();
  }

  async countByStatus(statuses: StoreStatus[]): Promise<number> {
    return prisma.store.count({
      where: { status: { in: statuses } }
    });
  }

  async findPaginated(options: SearchStoresOptions): Promise<PaginatedStores> {
    const { pageNumber, pageSize, isAdmin } = options;
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    let where: Prisma.StoreWhereInput = {};

    if (!isAdmin) {
      where = {
        status: {
          not: 'SUSPENDED'
        }
      };
    }

    const [total, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      data: stores,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
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
