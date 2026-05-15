'use server'

import { clerkClient } from '@clerk/nextjs/server';
import { StoreStatus } from '@prisma/client';
import prisma from '@/infrastructure/db/prisma';

export type RegisterSellerResult =
    | { success: true }
    | { success: false; error: string };

export async function registerSeller(
    formData: FormData,
): Promise<RegisterSellerResult> {

    const firstName = (formData.get('firstName') as string)?.trim();
    const lastName = (formData.get('lastName') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const storeName = (formData.get('storeName') as string)?.trim();
    const storeAddress = (formData.get('storeAddress') as string)?.trim();
    const storeDescription = (formData.get('storeDescription') as string)?.trim() || null;

    if (!firstName || !lastName || !email || !password || !storeName || !storeAddress) {
        return { success: false, error: 'Todos los campos obligatorios deben completarse.' };
    }

    if (password.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    const client = await clerkClient();
    let clerkUserId: string;

    try {
        const clerkUser = await client.users.createUser({
            firstName,
            lastName,
            emailAddress: [email],
            password,
            publicMetadata: { role: 'seller' },
        });
        clerkUserId = clerkUser.id;

        const emailId = clerkUser.emailAddresses[0]?.id;
        if (emailId) {
            await client.emailAddresses.updateEmailAddress(emailId, {
                verified: true,
            });
        }
    } catch (err: unknown) {
        const clerkError = err as { errors?: { message: string }[] };
        const message = clerkError?.errors?.[0]?.message ?? 'Error al crear el usuario.';
        return { success: false, error: message };
    }

    try {
        await prisma.$transaction(async (tx) => {
            const store = await tx.store.create({
                data: {
                    name: storeName,
                    description: storeDescription,
                    address: storeAddress,
                    status: StoreStatus.OPEN,
                },
            });

            await tx.seller.create({
                data: {
                    id: clerkUserId,
                    name: `${firstName} ${lastName}`.trim(),
                    email,
                    role: 'SELLER',
                    storeId: store.id,
                },
            });
        });
    } catch (err) {
        // --- Rollback: eliminar usuario de Clerk para evitar usuario huérfano ---
        try {
            await client.users.deleteUser(clerkUserId);
        } catch (rollbackErr) {
            console.error('Error en rollback de Clerk:', rollbackErr);
        }
        console.error('Error al persistir seller en la BD:', err);
        return { success: false, error: 'Error al guardar los datos. Intentá de nuevo.' };
    }

    return { success: true };
}
