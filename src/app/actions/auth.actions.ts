'use server'

import { clerkClient } from '@clerk/nextjs/server';
import { StoreStatus } from '@prisma/client';
import prisma from '@/infrastructure/db/prisma';
import type { ActionResult } from '@/types/action-result';

function parseSellerFormData(formData: FormData) {
    return {
        firstName: (formData.get('firstName') as string)?.trim(),
        lastName: (formData.get('lastName') as string)?.trim(),
        email: (formData.get('email') as string)?.trim(),
        password: formData.get('password') as string,
        storeName: (formData.get('storeName') as string)?.trim(),
        storeAddress: (formData.get('storeAddress') as string)?.trim(),
        storeDescription: (formData.get('storeDescription') as string)?.trim() || null,
    };
}

function validateSellerInput(data: ReturnType<typeof parseSellerFormData>): string | null {
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.storeName || !data.storeAddress)
        return 'Todos los campos obligatorios deben completarse.';
    if (data.password.length < 4)
        return 'La contraseña debe tener al menos 4 caracteres.';
    return null;
}

async function createClerkUser(
    client: Awaited<ReturnType<typeof clerkClient>>,
    data: ReturnType<typeof parseSellerFormData>,
): Promise<string> {
    const clerkUser = await client.users.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: [data.email],
        password: data.password,
        publicMetadata: { role: 'seller' },
    });
    return clerkUser.id;
}

async function persistSeller(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    data: ReturnType<typeof parseSellerFormData> & { clerkUserId: string },
): Promise<void> {
    const store = await tx.store.create({
        data: {
            name: data.storeName,
            description: data.storeDescription,
            address: data.storeAddress,
            status: StoreStatus.OPEN,
        },
    });

    await tx.seller.create({
        data: {
            id: data.clerkUserId,
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            role: 'SELLER',
            storeId: store.id,
        },
    });
}

async function rollbackClerkUser(
    client: Awaited<ReturnType<typeof clerkClient>>,
    clerkUserId: string,
): Promise<void> {
    try {
        await client.users.deleteUser(clerkUserId);
    } catch (rollbackErr) {
        console.error('Error en rollback de Clerk:', rollbackErr);
    }
}

function extractClerkErrorMessage(err: unknown): string {
    const clerkError = err as { errors?: { message: string }[] };
    return clerkError?.errors?.[0]?.message ?? 'Error al crear el usuario.';
}


export async function registerSeller(formData: FormData): Promise<ActionResult> {
    const data = parseSellerFormData(formData);

    const validationError = validateSellerInput(data);
    if (validationError) return { success: false, error: validationError };

    const client = await clerkClient();
    let clerkUserId: string;

    try {
        clerkUserId = await createClerkUser(client, data);
    } catch (err) {
        return { success: false, error: extractClerkErrorMessage(err) };
    }

    try {
        await prisma.$transaction(tx => persistSeller(tx, { clerkUserId, ...data }));
    } catch (err) {
        console.error('Error al persistir seller en la BD:', err);
        await rollbackClerkUser(client, clerkUserId);
        return { success: false, error: 'Error al guardar los datos. Intentá de nuevo.' };
    }

    return { success: true, data: undefined };
}
