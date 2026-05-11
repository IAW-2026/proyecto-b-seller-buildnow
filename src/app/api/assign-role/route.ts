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
  
  if (!existingSeller || !existingSeller.storeId) {
    redirect('/seller/onboarding');
  } else {
    redirect('/seller/dashboard');
  }
}
