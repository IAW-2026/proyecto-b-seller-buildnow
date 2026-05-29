import { auth } from '@clerk/nextjs/server';
import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';
import { Seller } from '@prisma/client';

export type SellerContext = {
  userId: string;
  seller: Seller & { storeId: string };
};

export type SellerContextResult =
  | { success: true; data: SellerContext }
  | { success: false; error: string };

export async function getSellerContext(): Promise<SellerContextResult> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'No autorizado' };
  }

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);

  if (!seller || !seller.storeId) {
    return { success: false, error: 'Tu cuenta no tiene una tienda asignada' };
  }

  return { success: true, data: { userId, seller: seller as Seller & { storeId: string } } };
}

