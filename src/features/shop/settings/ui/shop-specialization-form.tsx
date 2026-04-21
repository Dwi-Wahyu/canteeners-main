"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import MultipleSelector, { Option } from "@/components/multiple-select";
import { toast } from "sonner";
import { updateShopSpecializations } from "../../lib/shop-specialization-actions";
import { Category } from "@/generated/prisma";
import { Loader2 } from "lucide-react";

interface ShopSpecializationFormProps {
  shopId: string;
  allCategories: Category[];
  currentSpecializations: Category[];
}

export default function ShopSpecializationForm({
  shopId,
  allCategories,
  currentSpecializations,
}: ShopSpecializationFormProps) {
  const [isPending, startTransition] = useTransition();

  const options: Option[] = allCategories.map((cat) => ({
    label: cat.name,
    value: cat.id.toString(),
  }));

  const defaultValues: Option[] = currentSpecializations.map((cat) => ({
    label: cat.name,
    value: cat.id.toString(),
  }));

  const [selectedOptions, setSelectedOptions] = useState<Option[]>(defaultValues);

  const handleSubmit = () => {
    startTransition(async () => {
      const categoryIds = selectedOptions.map((opt) => parseInt(opt.value));
      const result = await updateShopSpecializations(shopId, categoryIds);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Pilih Kategori Spesialisasi Kedai
        </label>
        <p className="text-xs text-muted-foreground">
          Pilih satu atau lebih kategori makanan/minuman yang tersedia di kedai Anda.
          Hal ini akan memudahkan pelanggan menemukan kedai Anda saat melakukan pencarian.
        </p>
        <MultipleSelector
          value={selectedOptions}
          onChange={setSelectedOptions}
          defaultOptions={options}
          placeholder="Cari kategori..."
          emptyIndicator={
            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
              Kategori tidak ditemukan.
            </p>
          }
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan Spesialisasi"
        )}
      </Button>
    </div>
  );
}
