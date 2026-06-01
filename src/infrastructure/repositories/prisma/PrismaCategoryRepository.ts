import prisma from '../../db/prisma';
import { ICategoryRepository } from '../../../core/repositories/ICategoryRepository';
import { Category } from '@prisma/client';
import { ActionResult } from '../../../types/action-result';

export class PrismaCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<ActionResult<Category[]>> {
    try {
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      return { success: true, data: categories };
    } catch (error) {
      console.error('[PrismaCategoryRepository.findAll]', error);
      return { success: false, error: 'Error al buscar las categorías' };
    }
  }

  async findById(id: string): Promise<ActionResult<Category | null>> {
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      return { success: true, data: category };
    } catch (error) {
      console.error('[PrismaCategoryRepository.findById]', error);
      return { success: false, error: 'Error al buscar la categoría' };
    }
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionResult<Category>> {
    try {
      const category = await prisma.category.create({ data });
      return { success: true, data: category };
    } catch (error) {
      console.error('[PrismaCategoryRepository.create]', error);
      return { success: false, error: 'Error al crear la categoría' };
    }
  }

  async update(id: string, data: Partial<Category>): Promise<ActionResult<Category>> {
    try {
      const category = await prisma.category.update({ where: { id }, data });
      return { success: true, data: category };
    } catch (error) {
      console.error('[PrismaCategoryRepository.update]', error);
      return { success: false, error: 'Error al actualizar la categoría' };
    }
  }

  async delete(id: string): Promise<ActionResult<void>> {
    try {
      await prisma.category.delete({ where: { id } });
      return { success: true, data: undefined };
    } catch (error) {
      console.error('[PrismaCategoryRepository.delete]', error);
      return { success: false, error: 'Error al eliminar la categoría' };
    }
  }
}
