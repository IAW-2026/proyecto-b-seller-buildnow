import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { APP_ROLES } from "@/core/auth/roles";
import { ShieldAlert } from "lucide-react";

export default async function SellerZoneLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = sessionClaims?.metadata?.role as string | undefined;
  console.log(sessionClaims, userId);
  if (role === APP_ROLES.ADMIN) {
    redirect("/admin/dashboard");
  }

  // 2. Si es un Buyer (Comprador) o Delivery (Repartidor), le bloqueamos el acceso
  if (role === APP_ROLES.BUYER || role === APP_ROLES.DELIVERY) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white font-sans selection:bg-orange-500/30">
        <div className="flex flex-col items-center text-center max-w-md p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 shadow-2xl">
          <ShieldAlert size={64} className="text-red-500 mb-6" />
          <h1 className="text-2xl font-bold tracking-tight mb-2">Acceso Denegado</h1>
          <p className="text-zinc-400 mb-6">
            Esta zona es exclusiva para vendedores y dueños de corralones. Tu cuenta está registrada con el rol de <span className="font-semibold text-white uppercase">{role}</span>.
          </p>
        </div>
      </div>
    );
  }

  // 3. Si es un Vendedor (rol BASIC, SELLER o indefinido inicial), lo dejamos pasar
  return <>{children}</>;
}
