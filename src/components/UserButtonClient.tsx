"use client";
import dynamic from "next/dynamic";

const UserButton = dynamic(() => import("@clerk/nextjs").then(mod => mod.UserButton), { ssr: false });

export function UserButtonClient() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-9 w-9 ring-2 ring-orange-100 transition-all hover:ring-orange-300 shadow-sm",
        }
      }}
    />
  );
} 