import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaSellerRepository } from "@/infrastructure/repositories/prisma/PrismaSellerRepository";
import { getSellerContext } from "@/core/auth/getSellerContext";
import { PrismaStoreRepository } from "@/infrastructure/repositories/prisma/PrismaStoreRepository";
import { StoreStatus } from "@prisma/client";
import SuspendedStorePage from "@/components/SuspendendStore";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const contextResult = await getSellerContext();

  if (!contextResult.success) {
    redirect('/sign-in');
  }

  const storeRepo = new PrismaStoreRepository();
  const storeResult = await storeRepo.findById(contextResult.data.seller.storeId);

  if (storeResult.success && storeResult.data?.status === StoreStatus.SUSPENDED) {
    return <SuspendedStorePage />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 font-sans selection:bg-orange-500/30">
      <Sidebar />

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
