import prisma from '../../db/prisma';
import { IProductRepository, ProductWithCategory, SearchProductsOptions, SearchStoreProductsOptions, PaginatedProducts } from '../../../core/repositories/IProductRepository';
import { Product, Prisma, StoreStatus } from '@prisma/client';
import { ActionResult } from '../../../types/action-result';

export class PrismaProductRepository implements IProductRepository {
  async findById(id: string): Promise<ActionResult<Product | null>> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      return { success: true, data: product };
    } catch (error) {
      console.error('[PrismaProductRepository.findById]', error);
      return { success: false, error: 'Error al buscar el producto' };
    }
  }

  async findByIdWithCategory(id: string): Promise<ActionResult<ProductWithCategory | null>> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) return { success: true, data: null };

      return {
        success: true,
        data: {
          ...product,
          categoryName: product.category.name,
        }
      };
    } catch (error) {
      console.error('[PrismaProductRepository.findByIdWithCategory]', error);
      return { success: false, error: 'Error al buscar el producto con categoría' };
    }
  }

  async findByStore(storeId: string): Promise<ActionResult<ProductWithCategory[]>> {
    try {
      const products = await prisma.product.findMany({
        where: { storeId },
        include: { category: true },
      });

      return {
        success: true,
        data: products.map(p => ({ ...p, categoryName: p.category.name }))
      };
    } catch (error) {
      console.error('[PrismaProductRepository.findByStore]', error);
      return { success: false, error: 'Error al buscar productos de la tienda' };
    }
  }

  async findAll(categoryId?: string): Promise<ActionResult<ProductWithCategory[]>> {
    try {
      const where = categoryId ? { categoryId } : {};
      const products = await prisma.product.findMany({
        where,
        include: { category: true },
      });

      return {
        success: true,
        data: products.map(p => ({ ...p, categoryName: p.category.name }))
      };
    } catch (error) {
      console.error('[PrismaProductRepository.findAll]', error);
      return { success: false, error: 'Error al obtener todos los productos' };
    }
  }

  async countAll(): Promise<ActionResult<number>> {
    try {
      const count = await prisma.product.count();
      return { success: true, data: count };
    } catch (error) {
      console.error('[PrismaProductRepository.countAll]', error);
      return { success: false, error: 'Error al contar los productos' };
    }
  }

  async findPaginated(options: SearchProductsOptions): Promise<ActionResult<PaginatedProducts>> {
    try {
      const { categoryId, search, pageNumber, pageSize } = options;
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      // Excluir siempre productos de tiendas suspendidas
      const storeNotSuspended: Prisma.ProductWhereInput = {
        store: { status: { not: StoreStatus.SUSPENDED } }
      };

      let where: Prisma.ProductWhereInput = { ...storeNotSuspended };

      if (categoryId && search) {
        where = {
          ...storeNotSuspended,
          categoryId,
          name: { contains: search, mode: 'insensitive' }
        };
      } else if (categoryId) {
        where = { ...storeNotSuspended, categoryId };
      } else if (search) {
        where = { ...storeNotSuspended, name: { contains: search, mode: 'insensitive' } };
      }

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take,
          include: { category: true },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const data = products.map(p => ({ ...p, categoryName: p.category.name }));

      return {
        success: true,
        data: {
          data,
          total,
          page: pageNumber,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('[PrismaProductRepository.findPaginated]', error);
      return { success: false, error: 'Error al buscar productos paginados' };
    }
  }

  async findPaginatedByStore(options: SearchStoreProductsOptions): Promise<ActionResult<PaginatedProducts>> {
    try {
      const { storeId, categoryId, search, pageNumber, pageSize } = options;
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;

      const where: Prisma.ProductWhereInput = { storeId };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take,
          include: { category: true },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const data = products.map(p => ({ ...p, categoryName: p.category.name }));

      return {
        success: true,
        data: {
          data,
          total,
          page: pageNumber,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      console.error('[PrismaProductRepository.findPaginatedByStore]', error);
      return { success: false, error: 'Error al buscar productos de la tienda de forma paginada' };
    }
  }

  async findManyByIds(ids: string[]): Promise<ActionResult<Product[]>> {
    try {
      const products = await prisma.product.findMany({ where: { id: { in: ids } } });
      return { success: true, data: products };
    } catch (error) {
      console.error('[PrismaProductRepository.findManyByIds]', error);
      return { success: false, error: 'Error al buscar productos por IDs' };
    }
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<Product>> {
    try {
      const payload = { ...data };

      if (payload.stock <= 0) {
        payload.available = false;
      }

      const product = await prisma.product.create({ data: payload });
      return { success: true, data: product };
    } catch (error) {
      console.error('[PrismaProductRepository.create]', error);
      return { success: false, error: 'Error al crear el producto' };
    }
  }

  async update(id: string, data: Partial<Product>): Promise<ActionResult<Product>> {
    try {
      const payload = { ...data };

      if (payload.stock !== undefined && payload.stock <= 0) {
        payload.available = false;
      }

      const product = await prisma.product.update({ where: { id }, data: payload });
      return { success: true, data: product };
    } catch (error) {
      console.error('[PrismaProductRepository.update]', error);
      return { success: false, error: 'Error al actualizar el producto' };
    }
  }

  async delete(id: string): Promise<ActionResult<void>> {
    try {
      await prisma.product.delete({ where: { id } });
      return { success: true, data: undefined };
    } catch (error) {
      console.error('[PrismaProductRepository.delete]', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        return { success: false, error: "No se puede eliminar el producto porque tiene órdenes asociadas." };
      }
      return { success: false, error: 'Error al eliminar el producto' };
    }
  }
}
