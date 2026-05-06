import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { APP_ROLES } from '@/core/auth/roles';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/sign-in');
  }

  const client = await clerkClient();


  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: APP_ROLES.SELLER
    }
  });

  redirect('/seller/dashboard');
}
