'use server';

import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaCategoryRepository } from '@/infrastructure/repositories/prisma/PrismaCategoryRepository';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types/action-result';

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireRole([APP_ROLES.ADMIN]);

  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    return { success: false, error: 'El nombre de la categoría es obligatorio' };
  }

  const categoryRepo = new PrismaCategoryRepository();

  try {
    await categoryRepo.create({
      name: name.trim(),
    });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return { success: false, error: 'Ya existe una categoría con ese nombre' };
    }
    return { success: false, error: 'Error al crear la categoría' };
  }

  revalidatePath('/admin/dashboard/categories');
  return { success: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireRole([APP_ROLES.ADMIN]);

  const categoryRepo = new PrismaCategoryRepository();

  try {
    await categoryRepo.delete(id);
    revalidatePath('/admin/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'No se puede borrar esta categoría porque tiene productos de corralones asociados.',
    };
  }
}

export async function updateCategoryAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireRole([APP_ROLES.ADMIN]);

  const name = formData.get('name') as string;

  if (!name || name.trim() === '') {
    return { success: false, error: 'El nombre de la categoría no puede estar vacío' };
  }

  const categoryRepo = new PrismaCategoryRepository();

  try {
    await categoryRepo.update(id, { name: name.trim() });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002') {
      return { success: false, error: 'Ya existe una categoría con ese nombre' };
    }
    return { success: false, error: 'Error al actualizar la categoría' };
  }

  revalidatePath('/admin/dashboard/categories');
  return { success: true };
}