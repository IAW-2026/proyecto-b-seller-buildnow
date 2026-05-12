'use server';

import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaCategoryRepository } from '@/infrastructure/repositories/prisma/PrismaCategoryRepository';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(formData: FormData) {
  await requireRole([APP_ROLES.ADMIN]);
  
  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    throw new Error('El nombre de la categoría es obligatorio');
  }

  const categoryRepo = new PrismaCategoryRepository();
  
  try {
    await categoryRepo.create({
      name: name.trim(),
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Ya existe una categoría con ese nombre');
    }
    throw new Error('Error al crear la categoría');
  }

  revalidatePath('/admin/dashboard/categories');
}

export async function deleteCategoryAction(id: string) {
  await requireRole([APP_ROLES.ADMIN]);

  const categoryRepo = new PrismaCategoryRepository();
  
  try {
    await categoryRepo.delete(id);
  } catch (error: any) {
    throw new Error('No se puede borrar esta categoría porque tiene productos de corralones asociados.');
  }

  revalidatePath('/admin/dashboard/categories');
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireRole([APP_ROLES.ADMIN]);

  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    throw new Error('El nombre de la categoría no puede estar vacío');
  }

  const categoryRepo = new PrismaCategoryRepository();
  
  try {
    await categoryRepo.update(id, { name: name.trim() });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Ya existe una categoría con ese nombre');
    }
    throw new Error('Error al actualizar la categoría');
  }

  revalidatePath('/admin/dashboard/categories');
}