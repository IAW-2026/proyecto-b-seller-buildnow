import { auth } from '@clerk/nextjs/server';

export async function requireRole(allowedRoles: string[]) {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;

    if (process.env.SKIP_AUTH === 'true') return;

    if (!role || !allowedRoles.includes(role)) {
        throw new Error('No autorizado');
    }
}
