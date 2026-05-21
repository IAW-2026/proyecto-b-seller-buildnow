import prisma from '../../db/prisma';
import { IProductRepository, ProductWithCategory, SearchProductsOptions, SearchStoreProductsOptions, PaginatedProducts } from '../../../core/repositories/IProductRepository';
import { Product, Prisma } from '@prisma/client';

export class PrismaProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async findByIdWithCategory(id: string): Promise<ProductWithCategory | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) return null;

    return {
      ...product,
      categoryName: product.category.name,
    };
  }

  async findByStore(storeId: string): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: { category: true },
    });

    return products.map(p => ({ ...p, categoryName: p.category.name }));
  }

  async findByCategory(categoryId: string): Promise<ProductWithCategory[]> {
    const products = await prisma.product.findMany({
      where: { categoryId },
      include: { category: true },
    });

    return products.map(p => ({ ...p, categoryName: p.category.name }));
  }

  async findAll(categoryId?: string): Promise<ProductWithCategory[]> {
    const where = categoryId ? { categoryId } : {};
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
    });

    return products.map(p => ({ ...p, categoryName: p.category.name }));
  }

  async countAll(): Promise<number> {
    return prisma.product.count();
  }

  async findPaginated(options: SearchProductsOptions): Promise<PaginatedProducts> {
    const { categoryId, search, pageNumber, pageSize } = options;
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    let where: Prisma.ProductWhereInput = {};

    if (categoryId && search) {
      where = {
        categoryId,
        name: { contains: search, mode: 'insensitive' }
      };
    } else if (categoryId) {
      where = { categoryId };
    } else if (search) {
      where = { name: { contains: search, mode: 'insensitive' } };
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
      data,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async findPaginatedByStore(options: SearchStoreProductsOptions): Promise<PaginatedProducts> {
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
      data,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }
  async findManyByIds(ids: string[]): Promise<Product[]> {
    return prisma.product.findMany({ where: { id: { in: ids } } });
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const payload = { ...data };

    if (payload.stock <= 0) {
      payload.available = false;
    }

    return prisma.product.create({ data: payload });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const payload = { ...data };

    if (payload.stock !== undefined && payload.stock <= 0) {
      payload.available = false;
    }

    return prisma.product.update({ where: { id }, data: payload });
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.product.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new Error("No se puede eliminar el producto porque tiene órdenes asociadas.");
      }
      throw error;
    }
  }
}
