import { NextResponse } from 'next/server';
import { PrismaCategoryRepository } from '../../../infrastructure/repositories/prisma/PrismaCategoryRepository';

const categoryRepo = new PrismaCategoryRepository();

export async function GET() {
  try {
    const categories = await categoryRepo.findAll();

    const response = categories.map(category => ({
      id: category.id,
      name: category.name,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
