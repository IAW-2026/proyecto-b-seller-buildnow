import { ShoppingCart, Filter } from 'lucide-react';

export default function OrdersLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-zinc-300" />
            <div className="h-8 bg-zinc-200 rounded-md w-32 animate-pulse"></div>
          </h1>
          <div className="h-4 bg-zinc-100 rounded-md w-96 mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-zinc-300" />
          <div className="h-4 bg-zinc-200 rounded-md w-24 animate-pulse"></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 bg-zinc-100 rounded-full w-24 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-sm uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Referencia</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Monto</th>
                <th className="px-6 py-4 font-medium">Dirección</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-zinc-100 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-100 rounded-full w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-zinc-200 rounded w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-zinc-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-zinc-100 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-zinc-50 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-zinc-100 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
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
