"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

import { Field, FieldError } from "@/components/ui/field";
import { changeGuestName } from "@/features/user/lib/user-actions";
import { toast } from "sonner";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function GuestDetailsFormDialog({
  userId,
  showGuestDetailsFormDialog,
  setShowGuestDetailsFormDialog,
  saveGuestDetails,
}: {
  userId: string;
  showGuestDetailsFormDialog: boolean;
  setShowGuestDetailsFormDialog: (open: boolean) => void;
  saveGuestDetails: () => void;
}) {
  const { update, data: session } = useSession();
  const isMobile = useIsMobile();

  const [guestName, setGuestName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!guestName || isLoading) return;

    setIsLoading(true);

    const result = await changeGuestName({ id: userId, name: guestName });

    if (result.success) {
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: guestName,
          },
        });
      }

      setShowGuestDetailsFormDialog(false);
      saveGuestDetails();
    } else {
      toast.error("Terjadi kesalahan saat menyimpan nama");
    }
    setIsLoading(false);
  }

  const formFields = (
    <Field className="my-4">
      <Input
        id="username"
        autoComplete="off"
        value={guestName ?? ""}
        onChange={(event) => setGuestName(event.target.value)}
        aria-invalid={!guestName}
      />
      {!guestName && <FieldError>Tolong isi nama.</FieldError>}
    </Field>
  );

  if (isMobile) {
    return (
      <Drawer
        open={showGuestDetailsFormDialog}
        onOpenChange={setShowGuestDetailsFormDialog}
      >
        <DrawerContent className="p-6 min-h-[45vh]">
          <form onSubmit={handleSave} className="flex flex-col justify-between flex-1">
            <div>
              <DrawerHeader className="text-left px-0 pt-0">
                <DrawerTitle className="text-start">Masukkan Nama</DrawerTitle>
                <DrawerDescription className="text-start">
                  Agar anda mudah dikenali pemilik kedai
                </DrawerDescription>
              </DrawerHeader>

              {formFields}
            </div>

            <DrawerFooter className="px-0 pb-2 pt-4 flex-row justify-end gap-2 mt-auto">
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Batal
                </Button>
              </DrawerClose>
              <Button type="submit" disabled={!guestName || isLoading}>
                {isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                )}
                Simpan
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={showGuestDetailsFormDialog}
      onOpenChange={setShowGuestDetailsFormDialog}
    >
      <DialogContent>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle className="text-start">Masukkan Nama</DialogTitle>
            <DialogDescription className="text-start">
              Agar anda mudah dikenali pemilik kedai
            </DialogDescription>
          </DialogHeader>

          {formFields}

          <DialogFooter className="flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!guestName || isLoading}>
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


