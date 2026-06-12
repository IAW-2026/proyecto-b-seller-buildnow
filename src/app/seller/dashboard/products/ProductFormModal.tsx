'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Category } from '@prisma/client';
import { SerializedProduct } from './ProductsClient';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  editingProduct: SerializedProduct | null;
  categories: Category[];
  isLoading: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  categories,
  isLoading,
}: ProductFormModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setImagePreview(editingProduct?.img || null);
    } else {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(editingProduct?.img || null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
      variant="light"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nombre del producto</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={editingProduct?.name}
            className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Ej: Cemento Loma Negra 50kg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Imagen (Opcional)</label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 shrink-0 bg-zinc-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              />
              {editingProduct?.img && (
                <p className="text-xs text-zinc-500 mt-2">
                  El producto ya tiene una imagen asociada. Subir una nueva la reemplazará.
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Categoría</label>
          <select
            name="categoryId"
            required
            defaultValue={editingProduct?.categoryId}
            className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors appearance-none"
          >
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Precio ($)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              required
              defaultValue={editingProduct ? Number(editingProduct.price) : ''}
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              min="0"
              required
              defaultValue={editingProduct ? editingProduct.stock : ''}
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Peso (kg)</label>
          <input
            type="number"
            name="weight"
            step="0.01"
            min="0"
            required
            defaultValue={editingProduct ? Number(editingProduct.weight) : ''}
            className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            name="available"
            id="available"
            defaultChecked={editingProduct ? editingProduct.available : true}
            className="w-4 h-4 accent-orange-500 rounded"
          />
          <label htmlFor="available" className="text-sm font-medium text-zinc-700 cursor-pointer">
            Producto activo (visible en catálogo)
          </label>
        </div>

        <div className="pt-4 mt-6 border-t border-zinc-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
