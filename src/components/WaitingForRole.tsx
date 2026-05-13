"use client";
import { useAuth, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { assignSellerRole } from "@/app/actions/auth.actions";

export function WaitingForRole() {
  const { sessionClaims, isLoaded } = useAuth();
  const { session } = useSession();
  const router = useRouter();
  const assigningRef = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const role = (sessionClaims as any)?.metadata?.role;

    if (role === "admin") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      router.replace("/admin/dashboard");
      return;
    }

    if (role === "seller") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      router.replace("/seller/dashboard");
      return;
    }

    if (!role && !assigningRef.current) {
      assigningRef.current = true;

      assignSellerRole()
        .then(() => {
          pollingRef.current = setInterval(async () => {
            if (session) await session.reload();
          }, 2000);
        })
        .catch((err) => {
          console.error("Error asignando role:", err);
          assigningRef.current = false;
        });
    }
  }, [isLoaded, sessionClaims, session]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <p className="text-zinc-400">Configurando tu cuenta...</p>
    </div>
  );
}