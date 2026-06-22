import { UserButtonClient } from "../UserButtonClient";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 backdrop-blur-md px-8 sticky top-0 z-30">
      <div className="flex flex-1 items-center gap-6">
        <h1 className="text-xl font-semibold text-zinc-900">Panel de Control</h1>

      </div>

      <div className="flex items-center gap-5">

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
