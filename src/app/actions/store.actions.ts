'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { PrismaStoreRepository } from '../../infrastructure/repositories/prisma/PrismaStoreRepository';
import { PrismaSellerRepository } from '../../infrastructure/repositories/prisma/PrismaSellerRepository';
import { StoreStatus } from '@prisma/client';

export async function createStoreAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('No autorizado');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const address = formData.get('address') as string;

  if (!name || !address) {
    throw new Error('El nombre y la dirección son obligatorios');
  }

  const storeRepo = new PrismaStoreRepository();
  const sellerRepo = new PrismaSellerRepository();

  const seller = await sellerRepo.findById(userId);
  if (!seller) {
    throw new Error('Vendedor no encontrado en la base de datos');
  }

  if (seller.storeId) {
    redirect('/seller/dashboard');
  }

  const newStore = await storeRepo.create({
    name,
    description: description || null,
    address,
    status: StoreStatus.OPEN,
  });

  await sellerRepo.update(userId, { storeId: newStore.id });

  redirect('/seller/dashboard');
}
