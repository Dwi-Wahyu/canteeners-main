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

export function GuestDetailsFormDialog({
  showGuestDetailsFormDialog,
  setShowGuestDetailsFormDialog,
  guestName,
  setGuestName,
  onSaveGuestDetails,
}: {
  showGuestDetailsFormDialog: boolean;
  setShowGuestDetailsFormDialog: (open: boolean) => void;
  guestName: string | null;
  setGuestName: (guestName: string) => void;
  onSaveGuestDetails: () => void;
}) {
  function handleSave() {
    setShowGuestDetailsFormDialog(false);
    onSaveGuestDetails();
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

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit" disabled={!guestName} onClick={handleSave}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
