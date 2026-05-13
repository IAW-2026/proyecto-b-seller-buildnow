"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { APP_ROLES } from "@/core/auth/roles";

export async function assignSellerRole() {
    const { userId } = await auth();
    if (!userId) throw new Error("No autenticado");

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const existingRole = clerkUser.publicMetadata?.role as string | undefined;
    if (existingRole) return; // Ya tiene role, nada que hacer

    await client.users.updateUserMetadata(userId, {
        publicMetadata: { role: APP_ROLES.SELLER },
    });
}
