"use client";

import { LogOut, Store } from "lucide-react";
import { signOut } from "next-auth/react";

export default function OwnerTopbar({ shopName }: { shopName: string }) {
  function handleLogout() {
    signOut({
      redirectTo: "/login-kedai",
    });
  }

  return (
    <div className="justify-between px-5 py-3 bg-linear-to-r from-primary to-primary/90 shadow flex items-center z-50 fixed top-0 left-0 w-full">
      <div className="flex gap-2 items-center">
        <div className="p-2 bg-primary-foreground/20 text-primary-foreground rounded-xl">
          <Store />
        </div>

        <div className="text-primary-foreground">
          <h1 className="font-medium">{shopName}</h1>
          <h1 className="text-sm">Dashboard Pemilik</h1>
        </div>
      </div>

      <button onClick={handleLogout} className="text-primary-foreground">
        <LogOut />
      </button>
    </div>
  );
}
