"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "nextjs-toploader/app";
import { toggleProductAvailable } from "../lib/product-actions";

export default function ToggleProductAvailableButton({
  product_id,
  default_is_available,
}: {
  product_id: string;
  default_is_available: boolean;
}) {
  const [isAvailable, setIsAvailable] = useState(default_is_available);

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      return await toggleProductAvailable(product_id);
    },

    onError: (error) => {
      console.error(error);
      toast.error("Gagal memperbarui status produk");
    },
  });

  async function handleToggle() {
    const result = await mutation.mutateAsync();

    if (result.success) {
      setIsAvailable((prev) => !prev);
      router.refresh();
      toast.success("Status produk berhasil diperbarui!");
    } else {
      console.log(result.error.message);
      toast.error(result.error.message);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={mutation.isPending}>
          {isAvailable ? "Tersedia" : "Tidak Tersedia"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <DropdownMenuLabel>Status Produk</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={isAvailable}
          onCheckedChange={handleToggle}
        >
          Tersedia
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={!isAvailable}
          onCheckedChange={handleToggle}
        >
          Tidak Tersedia
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
