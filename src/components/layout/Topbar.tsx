
import { UserButtonClient } from "../UserButtonClient";
import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur-md px-8 sticky top-0 z-30">
      <div className="flex flex-1 items-center gap-6">
        <h1 className="text-xl font-semibold text-zinc-900">Panel de Control</h1>
        
        {/* Barra de búsqueda (placeholder para futuro uso) */}
        <div className="hidden max-w-md flex-1 items-center md:flex">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border-0 bg-zinc-100 py-1.5 pl-10 pr-3 text-zinc-900 ring-1 ring-inset ring-transparent placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition-all"
              placeholder="Buscar órdenes, productos..."
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button className="relative rounded-full bg-zinc-100 p-2.5 text-zinc-500 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm border border-transparent hover:border-orange-200">
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
          </span>
          <Bell size={18} />
        </button>
        
        <div className="h-8 w-px bg-zinc-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-medium text-zinc-900">Mi Corralón</span>
            <span className="text-xs text-zinc-500">Vendedor</span>
          </div>
          <UserButtonClient />  
        </div>
      </div>
    </header>
  );
}
