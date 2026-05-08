import { auth } from '@clerk/nextjs/server';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { Seller } from '@prisma/client';

export type SellerContext = {
  userId: string;
  seller: Seller & { storeId: string };
};

export async function getSellerContext(): Promise<SellerContext> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('No autorizado');
  }

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);

  if (!seller || !seller.storeId) {
    throw new Error('Tu cuenta no tiene una tienda asignada');
  }

  return { userId, seller: seller as Seller & { storeId: string } };
}
