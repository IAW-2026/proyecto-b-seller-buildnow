import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { requireRole } from "@/core/auth/auth";
import { APP_ROLES } from "@/core/auth/roles";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const roleCheck = await requireRole([APP_ROLES.ADMIN]);
  if (!roleCheck.success) redirect('/no-autorizado');

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans selection:bg-orange-500/30">
      <Sidebar role="ADMIN" />

      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}