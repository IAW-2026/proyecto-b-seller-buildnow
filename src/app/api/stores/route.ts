import { NextResponse } from 'next/server';
import { PrismaStoreRepository } from '../../../infrastructure/repositories/prisma/PrismaStoreRepository';

const storeRepo = new PrismaStoreRepository();

export async function GET() {
  try {
    const stores = await storeRepo.findAll();

    const response = stores.map(store => ({
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
