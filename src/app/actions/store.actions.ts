'use server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';
import { StoreStatus } from '@prisma/client';



export async function updateStoreAction(storeId: string, formData: FormData) {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  if (seller.storeId !== storeId) {
    throw new Error('No tenés permisos para editar esta tienda');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const address = formData.get('address') as string;
  const status = formData.get('status') as StoreStatus;

  if (!name || !address || !status) {
    throw new Error('El nombre, dirección y estado son obligatorios');
  }
  const VALID_STATUSES: StoreStatus[] = ["OPEN", "CLOSE"];
  if (!VALID_STATUSES.includes(status)) {
    throw new Error('Estado inválido');
  }

  const storeRepo = new PrismaStoreRepository();
  await storeRepo.update(storeId, {
    name,
    description: description || null,
    address,
    status,
  });

  revalidatePath('/seller/dashboard/store');
}
