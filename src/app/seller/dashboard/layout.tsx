import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaSellerRepository } from "@/infrastructure/repositories/prisma/PrismaSellerRepository";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const sellerRepo = new PrismaSellerRepository();
  const seller = await sellerRepo.findById(userId);

  if (!seller || !seller.storeId) {
    redirect("/seller/onboarding");
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
