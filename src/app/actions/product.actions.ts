'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { Prisma } from '@prisma/client';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { put, del } from '@vercel/blob';

export async function createProductAction(formData: FormData) {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const weight = parseFloat(formData.get('weight') as string);
  const available = formData.get('available') === 'on';

  if (!name || !categoryId || isNaN(price) || isNaN(stock) || isNaN(weight)) {
    throw new Error('Faltan campos obligatorios o hay campos con formato incorrecto');
  }

  const imageFile = formData.get('image') as File | null;
  let imgUrl: string | null = null;

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 4.5 * 1024 * 1024) {
      throw new Error('La imagen excede el límite de 4.5MB');
    }
    const blob = await put(imageFile.name, imageFile, { access: 'public' });
    imgUrl = blob.url;
  }

  const productRepo = new PrismaProductRepository();
  await productRepo.create({
    name,
    categoryId,
    price: new Prisma.Decimal(price),
    stock,
    weight: new Prisma.Decimal(weight),
    available,
    storeId: seller.storeId,
    img: imgUrl,
  });

  revalidatePath('/seller/dashboard/products');
}

export async function updateProductAction(productId: string, formData: FormData) {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const productRepo = new PrismaProductRepository();

  const existingProduct = await productRepo.findById(productId);
  if (!existingProduct || existingProduct.storeId !== seller.storeId) {
    throw new Error('Producto no encontrado o no tenés permisos para editarlo');
  }

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const weight = parseFloat(formData.get('weight') as string);
  const available = formData.get('available') === 'true' || formData.get('available') === 'on';

  if (!name || !categoryId || isNaN(price) || isNaN(stock) || isNaN(weight)) {
    throw new Error('Faltan campos obligatorios o hay campos con formato incorrecto');
  }

  const imageFile = formData.get('image') as File | null;
  let imgUrl = existingProduct.img;

  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 4.5 * 1024 * 1024) {
      throw new Error('La imagen excede el límite de 4.5MB');
    }
    const blob = await put(imageFile.name, imageFile, { access: 'public' });
    imgUrl = blob.url;

    // Eliminar la imagen vieja si existía
    if (existingProduct.img) {
      try {
        await del(existingProduct.img);
      } catch (err) {
        console.error('Error al borrar la imagen anterior de Vercel Blob:', err);
      }
    }
  }

  await productRepo.update(productId, {
    name,
    categoryId,
    price: new Prisma.Decimal(price),
    stock,
    weight: new Prisma.Decimal(weight),
    available,
    ...(imgUrl !== existingProduct.img && { img: imgUrl }),
  });

  revalidatePath('/seller/dashboard/products');
}

export async function deleteProductAction(productId: string) {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const productRepo = new PrismaProductRepository();

  const existingProduct = await productRepo.findById(productId);
  if (!existingProduct || existingProduct.storeId !== seller.storeId) {
    throw new Error('Producto no encontrado o no tenés permisos para borrarlo');
  }

  if (existingProduct.img) {
    try {
      await del(existingProduct.img);
    } catch (err) {
      console.error('Error al borrar la imagen de Vercel Blob al eliminar producto:', err);
    }
  }

  await productRepo.delete(productId);

  revalidatePath('/seller/dashboard/products');
}
