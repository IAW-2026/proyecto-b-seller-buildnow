import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';
import { PrismaOrderRepository } from '@/infrastructure/repositories/prisma/PrismaOrderRepository';

const orderRepo = new PrismaOrderRepository();

/**
 * Obtiene la lista paginada de órdenes (vista admin).
 *
 * Contrato: GET /api/admin/orders
 * Query params:
 *   - pageNumber  {number}        Página a solicitar (default: 1)
 *   - pageSize    {number}        Tamaño de página (default: 10)
 *   - storeId     {string}        Filtrar por tienda (opcional)
 *   - status      {OrderStatus}   Filtrar por estado (opcional)
 *
 * Respuesta:
 * {
 *   data:       Order[],
 *   total:      number,
 *   page:       number,
 *   pageSize:   number,
 *   totalPages: number,
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = sessionClaims?.metadata?.role as string | undefined;

    if (role !== APP_ROLES.ADMIN) {
      return NextResponse.json(
        { error: 'Tu rol no tiene permisos para realizar esta acción' },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;

    const page     = Math.max(1, Number(searchParams.get('pageNumber') ?? '1'));
    const pageSize = Math.max(1, Number(searchParams.get('pageSize')   ?? '10'));
    const storeId  = searchParams.get('storeId')  ?? undefined;
    const status   = searchParams.get('status')   ?? undefined;

    const result = await orderRepo.findAll(page, pageSize, storeId, status);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[GET /api/admin/orders]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
