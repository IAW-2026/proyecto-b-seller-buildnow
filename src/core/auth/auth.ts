import { auth } from '@clerk/nextjs/server';
import type { ActionResult } from '@/types/action-result';

export async function requireRole(allowedRoles: string[]): Promise<ActionResult> {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role;

    if (process.env.SKIP_AUTH === 'true') return { success: true, data: undefined };

    if (!role || !allowedRoles.includes(role)) {
        return { success: false, error: 'Tu rol no tiene permisos para realizar esta acción' };
    }

    return { success: true, data: undefined };
}
