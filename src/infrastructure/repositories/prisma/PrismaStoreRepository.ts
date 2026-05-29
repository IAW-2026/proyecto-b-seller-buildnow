import prisma from '../../db/prisma';
import { IStoreRepository, SearchStoresOptions, PaginatedStores } from '../../../core/repositories/IStoreRepository';
import { Store, StoreStatus, Prisma } from '@prisma/client';
import { ActionResult } from '../../../types/action-result';

export class PrismaStoreRepository implements IStoreRepository {
  async findAll(): Promise<ActionResult<Store[]>> {
    try {
      const stores = await prisma.store.findMany();
      return { success: true, data: stores };
    } catch (error) {
      console.error('[PrismaStoreRepository.findAll]', error);
      return { success: false, error: 'Error al obtener las tiendas' };
    }
  }

  async countByStatus(statuses: StoreStatus[]): Promise<ActionResult<number>> {
    try {
      const count = await prisma.store.count({
        where: { status: { in: statuses } }
      });
      return { success: true, data: count };
    } catch (error) {
      console.error('[PrismaStoreRepository.countByStatus]', error);
      return { success: false, error: 'Error al contar las tiendas por estado' };
    }
  }

  async findPaginated(options: SearchStoresOptions): Promise<ActionResult<PaginatedStores>> {
    try {
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
        success: true,
        data: {
          data: stores,
          total,
          page: pageNumber,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('[PrismaStoreRepository.findPaginated]', error);
      return { success: false, error: 'Error al buscar las tiendas de forma paginada' };
    }
  }

  async findById(id: string): Promise<ActionResult<Store | null>> {
    try {
      const store = await prisma.store.findUnique({ where: { id } });
      return { success: true, data: store };
    } catch (error) {
      console.error('[PrismaStoreRepository.findById]', error);
      return { success: false, error: 'Error al buscar la tienda por ID' };
    }
  }

  async findBySellerId(sellerId: string): Promise<ActionResult<Store | null>> {
    try {
      const store = await prisma.store.findFirst({
        where: {
          sellers: {
            some: {
              id: sellerId
            }
          }
        }
      });
      return { success: true, data: store };
    } catch (error) {
      console.error('[PrismaStoreRepository.findBySellerId]', error);
      return { success: false, error: 'Error al buscar la tienda del vendedor' };
    }
  }

  async create(data: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<Store>> {
    try {
      const store = await prisma.store.create({ data });
      return { success: true, data: store };
    } catch (error) {
      console.error('[PrismaStoreRepository.create]', error);
      return { success: false, error: 'Error al crear la tienda' };
    }
  }

  async update(id: string, data: Partial<Store>): Promise<ActionResult<Store>> {
    try {
      const store = await prisma.store.update({ where: { id }, data });
      return { success: true, data: store };
    } catch (error) {
      console.error('[PrismaStoreRepository.update]', error);
      return { success: false, error: 'Error al actualizar la tienda' };
    }
  }
}
