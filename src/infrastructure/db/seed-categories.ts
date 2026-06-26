// seed-categories.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Cemento y Morteros' },
  { name: 'Ladrillos y Bloques' },
  { name: 'Áridos (Arena, Piedra, Cascote)' },
  { name: 'Hierros y Mallas' },
  { name: 'Maderas y Placas' },
  { name: 'Caños y Conexiones de Agua' },
  { name: 'Caños y Conexiones de Gas' },
  { name: 'Electricidad y Materiales' },
  { name: 'Pinturas e Impermeabilizantes' },
  { name: 'Herramientas ' }
];

async function main() {
  console.log('Iniciando inserción de categorías...');

  for (const cat of categories) {
    // Usamos upsert para evitar errores de restricción única ('unique')
    // si el script se corre más de una vez.
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    console.log(`Categoría asegurada en BD: ${category.name}`);
  }

  console.log('✅ Categorías insertadas correctamente.');
}

main()
  .catch((e) => {
    console.error('Error insertando categorías:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });