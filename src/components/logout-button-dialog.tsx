"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useState } from "react";

import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { LogOut } from "lucide-react";

export default function LogoutButtonDialog() {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  function handleLogout() {
    signOut({
      redirectTo: "/auth/signin",
    });
  }

  return (
    <AlertDialog open={openLogoutDialog} onOpenChange={setOpenLogoutDialog}>
      <Item
        variant="outline"
        size="sm"
        className="w-full cursor-pointer"
        asChild
      >
        <button onClick={() => setOpenLogoutDialog(true)}>
          <ItemMedia>
            <LogOut className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Logout</ItemTitle>
          </ItemContent>
        </button>
      </Item>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anda yakin logout ?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan keluar dari sesi saat ini. Anda dapat masuk kembali kapan
            saja.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button variant={"destructive"} onClick={handleLogout}>
            Yakin
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
