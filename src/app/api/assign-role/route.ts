import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { APP_ROLES } from '@/core/auth/roles';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Si ya tiene role asignado, no reasignar
    const existingRole = clerkUser.publicMetadata?.role as string | undefined;
    if (existingRole) {
      return NextResponse.json({ ok: true, alreadyAssigned: true });
    }

    // Solo actualizar metadata en Clerk.
    // Esto disparará user.updated en el webhook, que se encarga de registrar en la DB.
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: APP_ROLES.SELLER }
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[assign-role] Error:', error);
    return NextResponse.json({ error: 'Error interno al asignar role' }, { status: 500 });
  }
}
