import { MetricCard } from '@/components/ui/MetricCard';
import { AlertCircle, Package, TrendingUp } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="h-8 bg-zinc-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-zinc-100 rounded w-96 animate-pulse"></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-pulse">
          <MetricCard
            title="Órdenes Pendientes"
            value="-"
            subtitle="Cargando..."
            icon={<AlertCircle className="text-zinc-300" size={24} />}
          />
        </div>
        <div className="animate-pulse">
          <MetricCard
            title="Productos sin Stock"
            value="-"
            subtitle="Cargando..."
            icon={<Package className="text-zinc-300" size={24} />}
          />
        </div>
        <div className="animate-pulse">
          <MetricCard
            title="Ventas del Día"
            value="-"
            subtitle="Cargando..."
            icon={<TrendingUp className="text-zinc-300" size={24} />}
          />
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-zinc-200 rounded w-40 animate-pulse"></div>
          <div className="h-4 bg-zinc-100 rounded w-20 animate-pulse"></div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-medium">Referencia</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium">Monto</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-3">
                    <div className="h-4 bg-zinc-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="h-5 bg-zinc-100 rounded-full w-24"></div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="h-4 bg-zinc-200 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="h-4 bg-zinc-100 rounded w-24"></div>
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
