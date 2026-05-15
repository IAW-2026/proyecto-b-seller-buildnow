import { auth } from "@clerk/nextjs/server";
import { PrismaSellerRepository } from "@/infrastructure/repositories/prisma/PrismaSellerRepository";
import { Seller } from "@prisma/client";

export async function getSeller(): Promise<Seller> {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const sellerRepo = new PrismaSellerRepository();
    const seller = await sellerRepo.findById(userId);
    if (!seller) throw new Error('Seller no encontrado');

    return seller;
}


