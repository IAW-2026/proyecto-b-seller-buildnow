import { Package, TrendingUp, AlertCircle, CheckCircle2, ShoppingCart } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Resumen de Actividad</h2>
          <p className="text-zinc-500 mt-1">Monitorea las ventas y órdenes de tu corralón en tiempo real.</p>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Órdenes Pendientes"
          value="12"
          subtitle="Prioridad alta"
          icon={<AlertCircle className="text-orange-500" size={24} />}
          trend="up"
          trendValue="+3"
        />
        <MetricCard
          title="Ventas del Día"
          value="$45,230"
          subtitle="Actualizado hace 5 min"
          icon={<TrendingUp className="text-emerald-500" size={24} />}
          trend="up"
          trendValue="+15%"
        />
        <MetricCard
          title="Órdenes Entregadas"
          value="28"
          subtitle="Hoy"
          icon={<CheckCircle2 className="text-blue-500" size={24} />}
        />
        <MetricCard
          title="Productos sin Stock"
          value="4"
          subtitle="Requieren atención"
          icon={<Package className="text-red-500" size={24} />}
        />
      </div>

      {/* Sección de Actividad Reciente (Placeholder) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Órdenes Recientes</h3>
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
              <ShoppingCart className="text-zinc-400" size={32} />
            </div>
            <h4 className="text-zinc-900 font-medium">No hay órdenes nuevas</h4>
            <p className="text-zinc-500 mt-1 text-sm">Las órdenes que ingresen aparecerán aquí para que las prepares.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para las tarjetas
function MetricCard({ title, value, subtitle, icon, trend, trendValue }: any) {
  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
      {/* Adorno visual sutil */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-zinc-50 group-hover:scale-110 transition-transform duration-500 z-0"></div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-zinc-900 tracking-tight">{value}</span>
            {trend && (
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2 ring-1 ring-zinc-100 group-hover:bg-white group-hover:ring-zinc-200 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  );
}
