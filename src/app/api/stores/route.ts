import { NextRequest, NextResponse } from 'next/server';
import { PrismaStoreRepository } from '../../../infrastructure/repositories/prisma/PrismaStoreRepository';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';

const storeRepo = new PrismaStoreRepository();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pageNumber = parseInt(searchParams.get('pageNumber') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    let isAdmin = false;
    const { userId } = await auth();

    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user.publicMetadata?.role === APP_ROLES.ADMIN) {
        isAdmin = true;
      }
    }

    const result = await storeRepo.findPaginated({
      pageNumber,
      pageSize,
      isAdmin,
    });

    const data = result.data.map(store => ({
      id: store.id,
      name: store.name,
      description: store.description,
      address: store.address,
      status: store.status,
    }));

    return NextResponse.json({
      data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error obteniendo tiendas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
