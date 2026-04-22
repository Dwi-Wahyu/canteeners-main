"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Check, Dot, Loader2, Minus, Plus, Star } from "lucide-react";
import { productOptionTypeMapping } from "@/constant/product-mapping";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { addToCart } from "@/features/cart/lib/cart-actions";
import { createGuestSession } from "@/helper/create-guest-session";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { GetProductById } from "../types/product-queries-types";

interface AddToCartDialogProps {
  product: NonNullable<GetProductById>;
  cartId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (shopCartId: string) => void;
}

export default function AddToCartDialog({
  product,
  cartId: initialCartId,
  isOpen,
  onOpenChange,
  onSuccess,
}: AddToCartDialogProps) {
  const activeCartId = useRef(initialCartId);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    activeCartId.current = initialCartId;
  }, [initialCartId]);

  useEffect(() => {
    if (isOpen) {
      setAdded(false);
      setQuantity(1);
      setSelectedOptions({});
    }
  }, [isOpen]);

  function handleSingleChange(optionId: string, valueId: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: [valueId],
    }));
  }

  function handleMultipleChange(optionId: string, valueId: string, checked: boolean) {
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

  function validateOptions(): boolean {
    if (!product.options) return true;
    for (const option of product.options) {
      if (option.is_required) {
        const selected = selectedOptions[option.id];
        if (!selected || selected.length === 0) {
          toast.error(`Mohon pilih varian ${option.option} terlebih dahulu.`);
          return false;
        }
      }
    }
    return true;
  }

  function calculateTotalPrice() {
    const basePrice = product.price;
    const allSelectedIds = Object.values(selectedOptions).flat();
    const additionalPriceTotal = (product.options || [])
      .flatMap((opt) => opt.values)
      .filter((val) => allSelectedIds.includes(val.id))
      .reduce((acc, curr) => acc + (curr.additional_price || 0), 0);

    return (basePrice + additionalPriceTotal) * quantity;
  }

  async function handleAddToCart() {
    if (!validateOptions()) return;

    setIsLoading(true);

    if (!activeCartId.current) {
      const { cartId: createdCartId } = await createGuestSession({
        name: "",
      });

      if (!createdCartId) {
        toast.error("Gagal membuat sesi tamu, silakan coba lagi");
        setIsLoading(false);
        return;
      }
      activeCartId.current = createdCartId;
    }

    const allSelectedValueIds = Object.values(selectedOptions).flat();

    const result = await addToCart({
      cartId: activeCartId.current!,
      shopId: product.shop_id,
      productId: product.id,
      quantity,
      selected_option_value_ids: allSelectedValueIds,
    });

    if (result.success) {
      setAdded(true);
      if (onSuccess) onSuccess(result.data!.shopCartId);
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } else {
      toast.error("Gagal menambahkan ke keranjang");
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        key={`${product.id}-${isOpen}`} 
        className="max-w-md max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Tambah ke Keranjang</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img
              src={getImageUrl("/product/" + product.image_url)}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-muted-foreground">{product.description || ""}</p>
          </div>

          <div className="flex gap-2 items-center text-sm">
            <div className="flex gap-1 items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {product.average_rating || 0}
            </div>
            <Dot />
            <span>Terjual {product._count?.order_items ?? 0}</span>
            <Dot />
            <span className="text-primary font-bold">{formatRupiah(product.price)}</span>
          </div>

          {product.options?.map((option) => (
            <div key={option.id} className="rounded-lg p-3 bg-accent/30 border border-accent">
              <h3 className="font-medium text-sm">{option.option}</h3>
              <div className="flex gap-1 items-baseline text-xs mb-2">
                <span className="text-muted-foreground">
                  {productOptionTypeMapping[option.type] || option.type}
                </span>
                {option.is_required ? (
                  <span className="text-red-500">(Wajib)</span>
                ) : (
                  <span className="text-muted-foreground">(Opsional)</span>
                )}
              </div>

              {option.type === "MULTIPLE" ? (
                <div className="space-y-2 mt-1">
                  {option.values.map((value) => (
                    <div key={value.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={value.id}
                          checked={selectedOptions[option.id]?.includes(value.id)}
                          onCheckedChange={(checked) =>
                            handleMultipleChange(option.id, value.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={value.id} className="text-sm cursor-pointer">
                          {value.value}
                        </Label>
                      </div>
                      {value.additional_price && value.additional_price > 0 && (
                        <span className="text-xs text-muted-foreground">
                          + {formatRupiah(value.additional_price)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={selectedOptions[option.id]?.[0] || ""}
                  onValueChange={(val) => handleSingleChange(option.id, val)}
                  className="space-y-2 mt-1"
                >
                  {option.values.map((value) => (
                    <div key={value.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={value.id} id={value.id} />
                        <Label htmlFor={value.id} className="text-sm cursor-pointer">
                          {value.value}
                        </Label>
                      </div>
                      {value.additional_price && value.additional_price > 0 && (
                        <span className="text-xs text-muted-foreground">
                          + {formatRupiah(value.additional_price)}
                        </span>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          ))}

          <div>
            <h3 className="font-semibold text-sm mb-2">Kuantitas</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-md font-bold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Button
            className="w-full mt-2 h-12 flex justify-between px-6"
            onClick={handleAddToCart}
            disabled={isLoading || added}
          >
            {isLoading ? (
              <div className="flex items-center gap-2 mx-auto">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Menambahkan...</span>
              </div>
            ) : added ? (
              <div className="flex items-center gap-2 mx-auto">
                <Check className="h-4 w-4" />
                <span>Berhasil!</span>
              </div>
            ) : (
              <>
                <span>Tambah Ke Keranjang</span>
                <span>{formatRupiah(calculateTotalPrice())}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
