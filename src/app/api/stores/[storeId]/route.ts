import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/core/auth/auth';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaStoreRepository } from '@/infrastructure/repositories/prisma/PrismaStoreRepository';

const storeRepo = new PrismaStoreRepository();

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const authResult = await requireRole([APP_ROLES.ADMIN]);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 403 });
        }
        const body = await request.json();
        const { status } = body;
        if (!status) {
            return NextResponse.json({ error: 'Falta campo obligatorio: status' }, { status: 400 });
        }
        const { storeId } = await params;
        if (!storeId) {
            return NextResponse.json({ error: 'Falta parametro obligatorio: storeId' }, { status: 400 });
        }
        const result = await storeRepo.update(storeId, { status });
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json(result.data, { status: 200 });
    } catch (error) {
        console.error('Error actualizando tienda:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
