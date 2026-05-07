import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { APP_ROLES } from '@/core/auth/roles';

import { PrismaSellerRepository } from '@/infrastructure/repositories/prisma/PrismaSellerRepository';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: APP_ROLES.SELLER }
  });



  // HACK LOCAL: Como los webhooks no llegan a localhost sin Ngrok, 
  // aseguramos que el usuario exista en Prisma manualmente acá.

  if (process.env.DEVELOPMENT) {
    const sellerRepo = new PrismaSellerRepository();
    const existingSeller = await sellerRepo.findById(userId);


    if (!existingSeller) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || 'sin_email';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Vendedor';

      await sellerRepo.create({
        id: userId,
        email: email,
        name: name,
        role: 'SELLER',
        storeId: null
      });

    }
  }


  redirect('/seller/dashboard');
}
