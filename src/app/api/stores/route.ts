import { NextResponse } from 'next/server';
import { PrismaStoreRepository } from '../../../infrastructure/repositories/prisma/PrismaStoreRepository';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { APP_ROLES } from '@/core/auth/roles';

const storeRepo = new PrismaStoreRepository();

export async function GET() {
  try {
    let isAdmin = false;
    const { userId } = await auth();
    
    if (userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      if (user.publicMetadata?.role === APP_ROLES.ADMIN) {
        isAdmin = true;
      }
    }

    const stores = await storeRepo.findAll();

    // Si no es admin (ej. buyer), filtramos las SUSPENDED
    const filteredStores = isAdmin 
      ? stores 
      : stores.filter(store => store.status !== 'SUSPENDED');

    const response = filteredStores.map(store => ({
      id: store.id,
      name: store.name,
      description: store.description,
      address: store.address,
      status: store.status,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo tiendas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
