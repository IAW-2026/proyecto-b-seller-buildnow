import prisma from '../../db/prisma';
import { ISellerRepository } from '../../../core/repositories/ISellerRepository';
import { Seller } from '@prisma/client';
import { ActionResult } from '../../../types/action-result';

export class PrismaSellerRepository implements ISellerRepository {
  async findById(id: string): Promise<ActionResult<Seller | null>> {
    try {
      const seller = await prisma.seller.findUnique({ where: { id } });
      return { success: true, data: seller };
    } catch (error) {
      console.error('[PrismaSellerRepository.findById]', error);
      return { success: false, error: 'Error al buscar el vendedor' };
    }
  }

  async create(data: Omit<Seller, 'createdAt' | 'updatedAt'>): Promise<ActionResult<Seller>> {
    try {
      const seller = await prisma.seller.create({ data });
      return { success: true, data: seller };
    } catch (error) {
      console.error('[PrismaSellerRepository.create]', error);
      return { success: false, error: 'Error al crear el vendedor' };
    }
  }

  async update(id: string, data: Partial<Seller>): Promise<ActionResult<Seller>> {
    try {
      const seller = await prisma.seller.update({ where: { id }, data });
      return { success: true, data: seller };
    } catch (error) {
      console.error('[PrismaSellerRepository.update]', error);
      return { success: false, error: 'Error al actualizar el vendedor' };
    }
  }

  async delete(id: string): Promise<ActionResult<void>> {
    try {
      await prisma.seller.delete({ where: { id } });
      return { success: true, data: undefined };
    } catch (error) {
      console.error('[PrismaSellerRepository.delete]', error);
      return { success: false, error: 'Error al eliminar el vendedor' };
    }
  }
}
