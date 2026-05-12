'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Settings, Store, Tags } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const sellerRoutes = [
  { href: '/seller/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/seller/dashboard/orders', label: 'Órdenes', icon: ShoppingCart },
  { href: '/seller/dashboard/products', label: 'Productos', icon: Package },
  { href: '/seller/dashboard/store', label: 'Mi Tienda', icon: Store },
  { href: '/seller/dashboard/settings', label: 'Configuración', icon: Settings },
];

const adminRoutes = [
  { href: '/admin/dashboard', label: 'General', icon: LayoutDashboard },
  { href: '/admin/dashboard/stores', label: 'Corralones', icon: Store },
  { href: '/admin/dashboard/orders', label: 'Órdenes Globales', icon: ShoppingCart },
  { href: '/admin/dashboard/categories', label: 'Categorías', icon: Tags },
];

export function Sidebar({ role = 'SELLER' }: { role?: 'ADMIN' | 'SELLER' }) {
  const pathname = usePathname();
  const routes = role === 'ADMIN' ? adminRoutes : sellerRoutes;

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-950 text-zinc-300 border-r border-zinc-800 shadow-2xl">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/20">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">BuildNow <span className="text-orange-500">Seller</span></span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Menu Principal
        </div>
        {routes.map((route) => {
          const Icon = route.icon;
                    // Si la ruta base es exactamente el dashboard principal, exigimos coincidencia estricta.
          // Para el resto (como products o orders), permitimos subrutas.
          const isActive = 
            route.href === '/seller/dashboard' 
              ? pathname === route.href 
              : pathname === route.href || pathname.startsWith(`${route.href}/`);
          
              return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-orange-500/10 to-transparent text-orange-500 border-l-2 border-orange-500" 
                  : "border-l-2 border-transparent text-zinc-400 hover:bg-zinc-900/80 hover:text-white"
              )}
            >
              <Icon 
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-300"
                )} 
              />
              {route.label}
            </Link>
          );
        })}
      </nav>
      
    </div>
  );
}
