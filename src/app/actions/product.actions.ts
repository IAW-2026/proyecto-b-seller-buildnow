'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/core/auth/auth';
import { getSellerContext } from '@/core/auth/getSellerContext';
import { APP_ROLES } from '@/core/auth/roles';
import { Prisma } from '@prisma/client';
import { PrismaProductRepository } from '@/infrastructure/repositories/prisma/PrismaProductRepository';
import { put, del } from '@vercel/blob';
import type { ActionResult } from '@/types/action-result';

export async function searchStoreProductsAction(params: {
  storeId: string;
  categoryId?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
}) {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  if (seller.storeId !== params.storeId) {
    throw new Error('No tenés permisos para acceder a esta tienda');
  }

  const productRepo = new PrismaProductRepository();
  const result = await productRepo.findPaginatedByStore({
    storeId: params.storeId,
    categoryId: params.categoryId,
    search: params.search,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  });

  const data = result.data.map(product => ({
    id: product.id,
    img: product.img,
    storeId: product.storeId,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    name: product.name,
    price: Number(product.price),
    stock: product.stock,
    weight: Number(product.weight),
    available: product.available,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));

  return {
    data,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}

export async function createProductAction(formData: FormData): Promise<ActionResult> {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const weight = parseFloat(formData.get('weight') as string);
  const available = formData.get('available') === 'on';

  if (!name || !categoryId || isNaN(price) || isNaN(stock) || isNaN(weight)) {
    return { success: false, error: 'Faltan campos obligatorios o hay campos con formato incorrecto' };
  }

  const imageFile = formData.get('image') as File | null;

  if (imageFile && imageFile.size > 4.5 * 1024 * 1024) {
    return { success: false, error: 'La imagen excede el límite de 4.5MB' };
  }

  const imgUrl = await handleImageUpload(imageFile);

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
  return { success: true };
}

export async function updateProductAction(productId: string, formData: FormData): Promise<ActionResult> {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const productRepo = new PrismaProductRepository();

  const existingProduct = await productRepo.findById(productId);
  if (!existingProduct || existingProduct.storeId !== seller.storeId) {
    return { success: false, error: 'Producto no encontrado o no tenés permisos para editarlo' };
  }

  const name = formData.get('name') as string;
  const categoryId = formData.get('categoryId') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string, 10);
  const weight = parseFloat(formData.get('weight') as string);
  const available = formData.get('available') === 'true' || formData.get('available') === 'on';

  if (!name || !categoryId || isNaN(price) || isNaN(stock) || isNaN(weight)) {
    return { success: false, error: 'Faltan campos obligatorios o hay campos con formato incorrecto' };
  }

  const imageFile = formData.get('image') as File | null;

  if (imageFile && imageFile.size > 4.5 * 1024 * 1024) {
    return { success: false, error: 'La imagen excede el límite de 4.5MB' };
  }

  const newImgUrl = await handleImageUpload(imageFile);

  if (newImgUrl && existingProduct.img) {
    await handleDeleteOldImage(existingProduct.img);
  }

  const imgUrl = newImgUrl || existingProduct.img;

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
  return { success: true };
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  await requireRole([APP_ROLES.SELLER]);
  const { seller } = await getSellerContext();

  const productRepo = new PrismaProductRepository();

  const existingProduct = await productRepo.findById(productId);
  if (!existingProduct || existingProduct.storeId !== seller.storeId) {
    return { success: false, error: 'Producto no encontrado o no tenés permisos para borrarlo' };
  }

  await handleDeleteOldImage(existingProduct.img);

  await productRepo.delete(productId);

  revalidatePath('/seller/dashboard/products');
  return { success: true };
}


async function handleImageUpload(imageFile: File | null): Promise<string | null> {
  if (!imageFile || imageFile.size === 0) return null;

  const blob = await put(imageFile.name, imageFile, { access: 'public' });
  return blob.url;
}

async function handleDeleteOldImage(imageUrl: string | null) {
  if (!imageUrl) return;

  try {
    await del(imageUrl);
  } catch (err) {
    console.error('Error al borrar la imagen de Vercel Blob:', err);
  }
}
