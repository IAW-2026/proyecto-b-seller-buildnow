
"use client";
import { UserButton } from "@clerk/nextjs";

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
/*
  'use client'

import { useClerk } from '@clerk/nextjs'

export const UserButtonClient = () => {
  const { signOut } = useClerk()

  return (
    // Clicking this button signs out a user
    // and redirects them to the home page "/".
    <button onClick={() => signOut({ redirectUrl: '/sign-in' })}>Sign out</button>
  )
}*/