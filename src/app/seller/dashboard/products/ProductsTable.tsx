'use client';

import { Edit2, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { SerializedProduct } from './ProductsClient';
import { PaginationMeta } from '@/types/pagination';

interface ProductsTableProps {
  products: SerializedProduct[];
  pagination: PaginationMeta;
  isSearching: boolean;
  onEdit: (product: SerializedProduct) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function ProductsTable({
  products,
  pagination,
  isSearching,
  onEdit,
  onDelete,
  onPageChange,
}: ProductsTableProps) {
  return (
    <div className={`bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm transition-opacity ${isSearching ? 'opacity-60' : 'opacity-100'}`}>
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
                  {isSearching ? 'Buscando productos...' : 'No se encontraron productos.'}
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
                      onClick={() => onEdit(product)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
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

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
