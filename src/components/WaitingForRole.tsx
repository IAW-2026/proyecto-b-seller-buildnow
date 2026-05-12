"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function WaitingForRole() {
  const { sessionClaims, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const role = (sessionClaims as any)?.metadata?.role;

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }
    
    if (role === "seller") {
      router.replace("/seller/dashboard");
      return;
    }
  }, [isLoaded, sessionClaims]); 

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <p className="text-zinc-400">Configurando tu cuenta...</p>
    </div>
  );
}