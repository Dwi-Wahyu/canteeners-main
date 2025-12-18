"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Trash2,
  Minus,
  Plus,
  Pencil,
  Save,
  AlertCircle,
  Settings2,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { changeCartItemDetails, deleteCartItem } from "../lib/cart-actions";
import { productOptionTypeMapping } from "@/constant/product-mapping";
import { GetShopCartItemType } from "../types/cart-queries-types";

export default function CartItemClient({
  data,
}: {
  data: GetShopCartItemType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState(data.quantity);
  const [note, setNote] = useState(data.note || "");

  // gunakan useMemo agar tidak dihitung ulang setiap render jika data tidak berubah
  const currentSubtotal = useMemo(() => {
    // Hitung total harga opsi yang sedang terpilih (dari data awal)
    const optionsTotal = data.selected_options.reduce(
      (sum, opt) => sum + (opt.additional_price || 0),
      0
    );

    // Hitung Harga Satuan Total (Harga Dasar + Biaya Layanan 1000 + Opsi)
    const unitPriceTotal = data.price_at_add + 1000 + optionsTotal;

    // Kalikan dengan Quantity State
    return unitPriceTotal * quantity;
  }, [data.price_at_add, data.selected_options, quantity]);

  const initialOptionsState = useMemo(() => {
    const state: Record<string, string[]> = {};
    data.product.options.forEach((opt) => {
      const selectedValuesForThisOption = opt.values
        .filter((val) =>
          data.selected_options.some((selected) => selected.id === val.id)
        )
        .map((val) => val.id);

      if (selectedValuesForThisOption.length > 0) {
        state[opt.id] = selectedValuesForThisOption;
      }
    });
    return state;
  }, [data]);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string[]>>(initialOptionsState);

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const hasQuantityChanges = quantity !== data.quantity;

  function handleSingleChange(optionId: string, valueId: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: [valueId],
    }));
  }

  function handleMultipleChange(
    optionId: string,
    valueId: string,
    checked: boolean
  ) {
    setSelectedOptions((prev) => {
      const currentValues = prev[optionId] || [];
      if (checked) {
        return { ...prev, [optionId]: [...currentValues, valueId] };
      } else {
        return {
          ...prev,
          [optionId]: currentValues.filter((id) => id !== valueId),
        };
      }
    });
  }

  const previewPrice = useMemo(() => {
    const basePrice = data.price_at_add;
    const allSelectedIds = Object.values(selectedOptions).flat();

    const additionalPriceTotal = data.product.options
      .flatMap((opt) => opt.values)
      .filter((val) => allSelectedIds.includes(val.id))
      .reduce((acc, curr) => acc + (curr.additional_price || 0), 0);

    return quantity * (basePrice + 1000 + additionalPriceTotal);
  }, [selectedOptions, data.product.options, data.price_at_add, quantity]);

  const handleSaveChanges = async () => {
    startTransition(async () => {
      const result = await changeCartItemDetails({
        id: data.id,
        quantity: quantity,
        note: note,
      });

      if (result.success) {
        toast.success("Perubahan berhasil disimpan");
        setIsConfirmOpen(false);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleSaveNote = async () => {
    startTransition(async () => {
      const result = await changeCartItemDetails({
        id: data.id,
        quantity: quantity,
        note: note,
      });

      if (result.success) {
        toast.success("Catatan disimpan");
        setIsNoteDialogOpen(false);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  const handleSaveOptions = async () => {
    for (const option of data.product.options) {
      if (option.is_required) {
        const selected = selectedOptions[option.id];
        if (!selected || selected.length === 0) {
          toast.error(`Mohon pilih varian ${option.option} terlebih dahulu.`);
          return;
        }
      }
    }

    startTransition(async () => {
      const allSelectedValueIds = Object.values(selectedOptions).flat();

      const result = await changeCartItemDetails({
        id: data.id,
        quantity: quantity,
        note: note,
        selected_option_value_ids: allSelectedValueIds,
      });

      if (result.success) {
        toast.success("Pilihan varian berhasil diperbarui");
        setIsOptionDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Image */}
      <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
        <Image
          src={getImageUrl(data.product.image_url)}
          alt={data.product.name}
          fill
          className="object-cover shadow rounded-md"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-2">
              {data.product.name}
            </h3>
            {/* --- UPDATE: TAMPILKAN HARGA KALKULASI (currentSubtotal) --- */}
            <p className="font-bold text-primary">
              {formatRupiah(currentSubtotal)}
            </p>
          </div>

          <p className="text-muted-foreground text-sm mb-2">
            Harga Dasar: {formatRupiah(data.price_at_add)}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2 mb-3">
            {data.selected_options.map((opt) => (
              <Badge
                key={opt.id}
                variant="secondary"
                className="text-xs font-normal"
              >
                {opt.value}
                {opt.additional_price &&
                  ` (+${formatRupiah(opt.additional_price)})`}
              </Badge>
            ))}

            {data.product.options.length && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setIsOptionDialogOpen(true)}
              >
                <Settings2 className="w-3 h-3" />
                Ubah
              </Button>
            )}
          </div>

          {/* ... (Bagian Notes tetap sama) ... */}
          <div
            className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors mt-2 bg-muted/30 p-2 rounded-md border border-dashed"
            onClick={() => setIsNoteDialogOpen(true)}
          >
            <Pencil className="w-3 h-3" />
            {data.note ? (
              <span className="italic">"{data.note}"</span>
            ) : (
              <span>Tambah catatan pesanan...</span>
            )}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex flex-1 items-center justify-evenly gap-3 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isPending}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-medium w-8 text-center text-sm">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={isPending}
            >
              <Plus />
            </Button>
          </div>

          <Button
            onClick={() => setIsConfirmOpen(true)}
            disabled={!hasQuantityChanges}
            size={"lg"}
            className="flex-1"
          >
            <Save />
            Simpan
          </Button>
        </div>
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-start">Catatan Pesanan</DialogTitle>
            <DialogDescription className="text-start">
              Tulis catatan untuk item ini
            </DialogDescription>
          </DialogHeader>
          <div className="pb-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-25"
            />
          </div>
          <DialogFooter className="justify-end flex-row">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSaveNote} disabled={isPending}>
              <Save /> Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        {/* ... konten dialog opsi (pastikan pakai previewPrice di sini) ... */}
        <DialogContent className="max-h-[90vh] flex flex-col">
          {/* ... Header & ScrollArea Loop Options sama ... */}
          <DialogHeader>
            <DialogTitle>Ubah Varian & Topping</DialogTitle>
            <DialogDescription>
              Sesuaikan pilihan untuk {data.product.name}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-6 py-2">
              {data.product.options.map((option) => (
                <div key={option.id} className="rounded-lg border p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{option.option}</h4>
                    <div className="flex gap-1 text-xs">
                      <span className="text-muted-foreground">
                        {productOptionTypeMapping[option.type]}
                      </span>
                      {option.is_required && (
                        <span className="text-red-500 font-medium">*Wajib</span>
                      )}
                    </div>
                  </div>
                  {option.type === "MULTIPLE" ? (
                    <div className="space-y-3">
                      {option.values.map((value) => {
                        const isChecked =
                          selectedOptions[option.id]?.includes(value.id) ||
                          false;
                        return (
                          <div
                            key={value.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`opt-${value.id}`}
                              checked={isChecked}
                              onCheckedChange={(c) =>
                                handleMultipleChange(
                                  option.id,
                                  value.id,
                                  c as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`opt-${value.id}`}
                              className="flex-1 flex justify-between cursor-pointer"
                            >
                              <span>{value.value}</span>
                              {value.additional_price && (
                                <span className="text-muted-foreground">
                                  +{formatRupiah(value.additional_price)}
                                </span>
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedOptions[option.id]?.[0] || ""}
                      onValueChange={(val) =>
                        handleSingleChange(option.id, val)
                      }
                    >
                      {option.values.map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={value.id}
                            id={`opt-${value.id}`}
                          />
                          <Label
                            htmlFor={`opt-${value.id}`}
                            className="flex-1 flex justify-between cursor-pointer"
                          >
                            <span>{value.value}</span>
                            {value.additional_price && (
                              <span className="text-muted-foreground">
                                +{formatRupiah(value.additional_price)}
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex justify-between items-center w-full sm:w-auto sm:flex-1 mr-4">
              <span className="text-sm text-muted-foreground">
                Estimasi Total:
              </span>
              {/* Preview price di dialog tetap menggunakan logic previewPrice (berdasarkan opsi yg sedang diedit) */}
              <span className="font-bold text-primary">
                {formatRupiah(previewPrice)}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <DialogClose asChild className="flex-1 sm:flex-none">
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button
                onClick={handleSaveOptions}
                disabled={isPending}
                className="flex-1 sm:flex-none"
              >
                {isPending ? "Menyimpan..." : "Simpan Pilihan"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Simpan Perubahan Kuantitas?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Harga akan dikalkulasi ulang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end mt-4">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveChanges}>
              Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
