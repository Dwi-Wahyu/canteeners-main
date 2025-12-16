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
import { Input } from "@/components/ui/input";

import { Field, FieldError } from "@/components/ui/field";
import { changeGuestName } from "@/features/user/lib/user-actions";
import { toast } from "sonner";
import { useState } from "react";

export function GuestDetailsFormDialog({
  userId,
  showGuestDetailsFormDialog,
  setShowGuestDetailsFormDialog,
  guestName,
  setGuestName,
  saveGuestDetails,
}: {
  userId: string;
  showGuestDetailsFormDialog: boolean;
  setShowGuestDetailsFormDialog: (open: boolean) => void;
  guestName: string | null;
  setGuestName: (guestName: string) => void;
  saveGuestDetails: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);

    const result = await changeGuestName({ id: userId, name: guestName! });

    if (result.success) {
      setShowGuestDetailsFormDialog(false);
      saveGuestDetails();
      setIsLoading(false);
    } else {
      toast.error("Terjadi kesalahan saat menyimpan nama");
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={showGuestDetailsFormDialog}
      onOpenChange={setShowGuestDetailsFormDialog}
    >
      <form>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-start">Masukkan Nama</DialogTitle>
            <DialogDescription className="text-start">
              Agar anda mudah dikenali pemilik kedai
            </DialogDescription>
          </DialogHeader>

          <Field>
            <Input
              id="username"
              autoComplete="off"
              value={guestName ?? ""}
              onChange={(event) => setGuestName(event.target.value)}
              aria-invalid={!guestName}
            />
            {!guestName && <FieldError>Tolong isi nama.</FieldError>}
          </Field>

          <DialogFooter className="flex-row justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!guestName || isLoading}
              onClick={handleSave}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
