"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleProductAvailable } from "../lib/product-actions";
import { BadgeCheck, BadgeX, Loader2 } from "lucide-react";

export default function ToggleProductAvailableButton({
  product_id,
  default_is_available,
}: {
  product_id: string;
  default_is_available: boolean;
}) {
  const [isAvailable, setIsAvailable] = useState(default_is_available);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        const result = await toggleProductAvailable(product_id);

        if (result.success) {
          setIsAvailable((prev) => !prev);
        } else {
          toast.error(result.error.message || "Gagal memperbarui status");
        }
      } catch (error) {
        console.error(error);
        toast.error("Terjadi kesalahan pada sistem");
      }
    });
  }

  const bgStyles = isAvailable
    ? "bg-primary text-primary-foreground"
    : "bg-destructive text-destructive-foreground";

  return (
    <div
      className={`px-4 py-3 cursor-pointer shadow rounded-lg transition-all duration-200 ${bgStyles} ${
        isPending
          ? "brightness-75 cursor-not-allowed opacity-90"
          : "hover:brightness-110"
      }`}
      onClick={() => {
        if (!isPending) handleToggle();
      }}
    >
      <div className="flex gap-2">
        {isPending ? (
          <Loader2 className="w-4 h-4 mt-1 animate-spin" />
        ) : isAvailable ? (
          <BadgeCheck className="w-4 h-4 mt-1" />
        ) : (
          <BadgeX className="w-4 h-4 mt-1" />
        )}

        <div>
          <h1 className="font-medium">
            Produk {isAvailable ? "Tersedia" : "Tidak Tersedia"}
          </h1>
          <p className="text-sm opacity-80">
            {isPending ? "Sedang memperbarui..." : "Klik untuk mengubah status"}
          </p>
        </div>
      </div>
    </div>
  );
}
