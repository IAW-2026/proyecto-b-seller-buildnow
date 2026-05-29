'use client';

import { useState, useCallback } from 'react';
import { ProductWithCategory } from '@/core/repositories/IProductRepository';
import { Category } from '@prisma/client';
import { Plus, Package } from 'lucide-react';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { ProductFilters } from './ProductFilters';
import { ProductFormModal } from './ProductFormModal';
import { ProductsTable } from './ProductsTable';
import { createProductAction, updateProductAction, deleteProductAction, searchStoreProductsAction } from '@/app/actions/product.actions';
import { PAGE_SIZE } from '@/core/config/pagination';
import toast from 'react-hot-toast';

export type SerializedProduct = Omit<ProductWithCategory, 'price' | 'weight'> & {
  price: number;
  weight: number;
};

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function ProductsClient({
  initialProducts,
  categories,
  storeId,
  initialPagination,
}: {
  initialProducts: SerializedProduct[];
  categories: Category[];
  storeId: string;
  initialPagination: PaginationMeta;
}) {
  const [products, setProducts] = useState<SerializedProduct[]>(initialProducts);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [currentPage, setCurrentPage] = useState(initialPagination.page);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SerializedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = useCallback(async (
    page: number,
    search?: string,
    categoryId?: string,
  ) => {
    setIsSearching(true);
    try {
      const result = await searchStoreProductsAction({
        storeId,
        categoryId,
        search,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setProducts(result.data as SerializedProduct[]);
      setPagination({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
      setCurrentPage(result.page);
    } catch {
      toast.error('Error al buscar productos');
    } finally {
      setIsSearching(false);
    }
  }, [storeId]);

  const handleFilterChange = useCallback((filters: { search?: string; categoryId?: string }) => {
    setSearchTerm(filters.search);
    setSelectedCategoryId(filters.categoryId);
    fetchProducts(1, filters.search, filters.categoryId);
  }, [fetchProducts]);

  const handlePageChange = useCallback((page: number) => {
    fetchProducts(page, searchTerm, selectedCategoryId);
  }, [fetchProducts, searchTerm, selectedCategoryId]);

  const refreshCurrentPage = useCallback(() => {
    fetchProducts(currentPage, searchTerm, selectedCategoryId);
  }, [fetchProducts, currentPage, searchTerm, selectedCategoryId]);

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
      const result = await deleteProductAction(productToDelete);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success('Producto eliminado exitosamente');
      closeDeleteModal();
      refreshCurrentPage();
    } catch (error) {
      toast.error('Ocurrió un error inesperado al intentar eliminar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = editingProduct
        ? await updateProductAction(editingProduct.id, formData)
        : await createProductAction(formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
      closeModal();
      refreshCurrentPage();
    } catch (error) {
      toast.error('Ocurrió un error inesperado de conexión.');
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

      <ProductFilters
        categories={categories}
        onFilterChange={handleFilterChange}
        isSearching={isSearching}
      />

      <ProductsTable
        products={products}
        pagination={pagination}
        isSearching={isSearching}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onPageChange={handlePageChange}
      />

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
        categories={categories}
        isLoading={isLoading}
      />

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
