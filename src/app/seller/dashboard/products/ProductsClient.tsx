'use client';

import { useState } from 'react';
import { ProductWithCategory } from '@/core/repositories/IProductRepository';
import { Category } from '@prisma/client';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { createProductAction, updateProductAction, deleteProductAction } from '@/app/actions/product.actions';
import toast from 'react-hot-toast';

export type SerializedProduct = Omit<ProductWithCategory, 'price' | 'weight'> & {
  price: number;
  weight: number;
};

export function ProductsClient({
  products,
  categories,
}: {
  products: SerializedProduct[];
  categories: Category[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SerializedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: SerializedProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openDeleteModal = (id: string) => setProductToDelete(id);
  const closeDeleteModal = () => setProductToDelete(null);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsLoading(true);
    try {
      await deleteProductAction(productToDelete);
      toast.success('Producto eliminado exitosamente');
      closeDeleteModal();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const imageFile = formData.get('image') as File | null;
    if (imageFile && imageFile.size > 4.5 * 1024 * 1024) {
      toast.error('La imagen excede el límite de 4.5MB');
      setIsLoading(false);
      return;
    }

    try {
      if (editingProduct) {
        await updateProductAction(editingProduct.id, formData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await createProductAction(formData);
        toast.success('Producto creado exitosamente');
      }
      closeModal();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" />
            Mis Productos
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Gestiona el inventario de tu corralón
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-sm uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Precio</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No tienes productos registrados.
                  </td>
                </tr>
              ) : null}

              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{product.name}</div>
                    <div className="text-xs text-zinc-500">{Number(product.weight)} kg</div>
                  </td>
                  <td className="px-6 py-4">{product.categoryName}</td>
                  <td className="px-6 py-4 font-medium text-orange-600">
                    ${Number(product.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-100 text-zinc-600'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.available ? 'bg-green-500/10 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      {product.available ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        variant="light"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
            />
            {editingProduct?.img && (
              <p className="text-xs text-zinc-500 mt-2">
                El producto ya tiene una imagen asociada. Subir una nueva la reemplazará.
              </p>
            )}
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
              onClick={closeModal}
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

      <ConfirmDeleteModal
        isOpen={!!productToDelete}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        isLoading={isLoading}
      />
    </div>
  );
}
