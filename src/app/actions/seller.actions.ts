import { auth } from "@clerk/nextjs/server";
import { PrismaSellerRepository } from "@/infrastructure/repositories/prisma/PrismaSellerRepository";
import { clerkClient } from "@clerk/nextjs/server";
import { Seller } from "@prisma/client";

export async function getOrCreateSeller(): Promise<Seller> {
    const { userId } = await auth();
    if (!userId) throw new Error('No autorizado');

    const sellerRepo = new PrismaSellerRepository();

    let seller = await sellerRepo.findById(userId);
    if (!seller) {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Vendedor';

        seller = await sellerRepo.create({ id: userId, name, email, role: 'SELLER', storeId: null });
    }

    return seller;
}