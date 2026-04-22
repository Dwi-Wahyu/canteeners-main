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
import { calculateCommission } from "@/helper/pricing-helper";

export default function CartItemClient({
  data,
}: {
  data: GetShopCartItemType;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState(data.quantity);
  const [note, setNote] = useState(data.note || "");

  const initialOptionsState = useMemo(() => {
    const state: Record<string, string[]> = {};
    data.product.options.forEach((opt) => {
      const selectedValuesForThisOption = opt.values
        .filter((val) =>
          data.selected_options.some((selected) => selected.id === val.id),
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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Check for any changes
  const hasChanges = useMemo(() => {
    const quantityChanged = quantity !== data.quantity;
    const noteChanged = note !== (data.note || "");

    // Check if options changed
    const initialValues = Object.values(initialOptionsState)
      .flat()
      .sort()
      .join(",");
    const currentValues = Object.values(selectedOptions)
      .flat()
      .sort()
      .join(",");
    const optionsChanged = initialValues !== currentValues;

    return quantityChanged || noteChanged || optionsChanged;
  }, [
    quantity,
    data.quantity,
    note,
    data.note,
    initialOptionsState,
    selectedOptions,
  ]);

  const currentSubtotal = useMemo(() => {
    const basePrice = data.price_at_add;
    const allSelectedIds = Object.values(selectedOptions).flat();

    const additionalPriceTotal = data.product.options
      .flatMap((opt) => opt.values)
      .filter((val) => allSelectedIds.includes(val.id))
      .reduce((acc, curr) => acc + (curr.additional_price || 0), 0);

    const basePriceTotal = (basePrice + additionalPriceTotal) * quantity;
    return basePriceTotal + calculateCommission(quantity);
  }, [selectedOptions, data.product.options, data.price_at_add, quantity]);

  function handleSingleChange(optionId: string, valueId: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: [valueId],
    }));
  }

  function handleMultipleChange(
    optionId: string,
    valueId: string,
    checked: boolean,
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

  const handleSaveChanges = async () => {
    // Validate required options
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
        toast.success("Perubahan berhasil disimpan");
        setIsConfirmOpen(false);
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="relative w-full md:w-1/3 aspect-square shrink-0">
          <Image
            src={getImageUrl("/product/" + data.product.image_url)}
            alt={data.product.name}
            fill
            className="object-cover shadow rounded-xl"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-bold text-2xl">{data.product.name}</h3>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Harga Satuan
            </p>
            <p className="font-bold text-xl text-primary">
              {formatRupiah(data.price_at_add)}
            </p>
          </div>
        </div>
      </div>
      <hr />
      {/* Options Selection */}
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" />
          Pilihan Varian & Topping
        </h4>
        <div className="grid gap-4">
          {data.product.options.map((option) => (
            <div
              key={option.id}
              className="rounded-xl border bg-card p-4 shadow-xs"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{option.option}</h4>
                <div className="flex gap-1 text-xs">
                  <Badge
                    variant="outline"
                    className="font-normal text-muted-foreground"
                  >
                    {productOptionTypeMapping[option.type]}
                  </Badge>
                  {option.is_required && (
                    <Badge
                      variant="destructive"
                      className="bg-red-50 text-red-600 border-red-100"
                    >
                      Wajib
                    </Badge>
                  )}
                </div>
              </div>
              {option.type === "MULTIPLE" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {option.values.map((value) => {
                    const isChecked =
                      selectedOptions[option.id]?.includes(value.id) || false;
                    return (
                      <div
                        key={value.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-primary/5 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() =>
                          handleMultipleChange(option.id, value.id, !isChecked)
                        }
                      >
                        <Checkbox
                          id={`opt-${value.id}`}
                          checked={isChecked}
                          onCheckedChange={() => {}} // Handled by div onClick
                        />
                        <div className="flex-1 flex justify-between items-center cursor-pointer">
                          <span className="text-sm font-medium">
                            {value.value}
                          </span>
                          {value.additional_price &&
                            value.additional_price > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{formatRupiah(value.additional_price)}
                              </span>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <RadioGroup
                  value={selectedOptions[option.id]?.[0] || ""}
                  onValueChange={(val) => handleSingleChange(option.id, val)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {option.values.map((value) => {
                    const isSelected =
                      selectedOptions[option.id]?.[0] === value.id;
                    return (
                      <div
                        key={value.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary/5 border-primary"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSingleChange(option.id, value.id)}
                      >
                        <RadioGroupItem
                          value={value.id}
                          id={`opt-${value.id}`}
                        />
                        <div className="flex-1 flex justify-between items-center cursor-pointer">
                          <span className="text-sm font-medium">
                            {value.value}
                          </span>
                          {value.additional_price &&
                            value.additional_price > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{formatRupiah(value.additional_price)}
                              </span>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Note Section */}
      <div className="space-y-2">
        <Label
          htmlFor="item-note"
          className="font-bold text-lg flex items-center gap-2"
        >
          <Pencil className="w-5 h-5 text-primary" />
          Catatan Pesanan
        </Label>
        <Textarea
          id="item-note"
          placeholder="Contoh: Gak pake seledri ya bang..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-24 rounded-xl resize-none bg-muted/20"
        />
      </div>
      <div className="h-24" /> {/* Spacer for sticky button */}
      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-20">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-1 border">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isPending}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold w-6 text-center text-lg">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => setIsConfirmOpen(true)}
            disabled={!hasChanges || isPending}
            className="flex-1 h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
          >
            {isPending ? (
              "Menyimpan..."
            ) : (
              <div className="flex justify-between items-center w-full px-2">
                <span>Simpan</span>
                <span>{formatRupiah(currentSubtotal)}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start">
              Simpan Perubahan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              Semua perubahan pada kuantitas, catatan, dan varian akan disimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end mt-4 gap-2">
            <AlertDialogCancel className="mt-0">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveChanges}>
              Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
