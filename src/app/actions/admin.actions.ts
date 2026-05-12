'use server';

import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { StoreStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function toggleStoreSuspensionAction(storeId: string, suspend: boolean) {
  await requireRole([APP_ROLES.ADMIN]);

  const storeRepo = new PrismaStoreRepository();
  const store = await storeRepo.findById(storeId);

  if (!store) {
    throw new Error('Tienda no encontrada');
  }

  const newStatus = suspend ? StoreStatus.SUSPENDED : StoreStatus.OPEN;

  await storeRepo.update(storeId, { status: newStatus });

  revalidatePath('/admin/dashboard/stores');
  revalidatePath(`/admin/dashboard/stores/${storeId}`);
}