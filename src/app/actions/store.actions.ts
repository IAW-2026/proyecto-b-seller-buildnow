'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { StoreStatus } from '@prisma/client';
import type { ActionResult } from '@/types/action-result';

export async function updateStoreAction(storeId: string, formData: FormData): Promise<ActionResult> {
  const roleCheck = await requireRole([APP_ROLES.SELLER]);
  if (!roleCheck.success) return roleCheck;

  const sellerCtx = await getSellerContext();
  if (!sellerCtx.success) return sellerCtx;
  const { seller } = sellerCtx.data;

  if (seller.storeId !== storeId) {
    return { success: false, error: 'No tenés permisos para editar esta tienda' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const address = formData.get('address') as string;
  const status = formData.get('status') as StoreStatus;

  if (!name || !address || !status) {
    return { success: false, error: 'El nombre, dirección y estado son obligatorios' };
  }

  const VALID_STATUSES: StoreStatus[] = ['OPEN', 'CLOSE'];
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: 'Estado inválido' };
  }

  const storeRepo = new PrismaStoreRepository();
  await storeRepo.update(storeId, {
    name,
    description: description || null,
    address,
    status,
  });

  revalidatePath('/seller/dashboard/store');
  return { success: true };
}
