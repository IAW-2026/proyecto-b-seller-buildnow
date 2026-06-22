import { Package } from 'lucide-react';

export default function ProductsLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-zinc-300" />
            <div className="h-8 bg-zinc-200 rounded-md w-48 animate-pulse"></div>
          </h1>
          <div className="h-4 bg-zinc-100 rounded-md w-64 mt-2 animate-pulse"></div>
        </div>
        <div className="h-10 bg-zinc-200 rounded-lg w-40 animate-pulse"></div>
      </div>

      {/* Table Skeleton */}
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
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-zinc-100 rounded w-1/4"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-200 rounded w-1/3"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-100 rounded-full w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-100 rounded-full w-16"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg"></div>
                      <div className="w-8 h-8 bg-zinc-100 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
