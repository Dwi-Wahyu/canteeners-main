"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Dot, Loader, Loader2, Minus, Plus, Star } from "lucide-react";
import { productOptionTypeMapping } from "@/constant/product-mapping";
import { formatRupiah } from "@/helper/format-rupiah";
import { GetProductById } from "../types/product-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { addToCart } from "@/features/cart/lib/cart-actions";
import { createGuestSession } from "@/helper/create-guest-session";
import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "next/navigation";

export default function GuestProductDetail({
  data,
  cartId: initialCartId,
  backUrl,
}: {
  data: NonNullable<GetProductById>;
  cartId: string | undefined;
  backUrl: string;
}) {
  const router = useRouter();
  // Gunakan State atau Ref untuk menyimpan cartId yang mungkin berubah dan butuh nilainya instan tanpa menunggu re-render untuk logika,
  // tapi useState juga oke jika ingin memicu UI update.
  const queryClient = useQueryClient();

  const getInitialCartId = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeCartId");
      if (saved) return saved;
    }
    return initialCartId;
  };
  const activeCartId = useRef(getInitialCartId());

  // Update ref jika prop berubah (misal setelah refresh halaman)
  useEffect(() => {
    if (initialCartId) {
      activeCartId.current = initialCartId;
    }
  }, [initialCartId]);

  const [quantity, setQuantity] = useState(1);

  // State menyimpan array string agar bisa mengakomodasi MULTIPLE selection
  // Key: Option ID, Value: Array of Value ID
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  // Handle perubahan untuk SINGLE (Radio)
  function handleSingleChange(optionId: string, valueId: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: [valueId], // Selalu replace dengan array berisi 1 item
    }));
  }

  // Handle perubahan untuk MULTIPLE (Checkbox)
  function handleMultipleChange(
    optionId: string,
    valueId: string,
    checked: boolean,
  ) {
    setSelectedOptions((prev) => {
      const currentValues = prev[optionId] || [];
      if (checked) {
        // Tambahkan valueId jika dicentang
        return { ...prev, [optionId]: [...currentValues, valueId] };
      } else {
        // Hapus valueId jika tidak dicentang
        return {
          ...prev,
          [optionId]: currentValues.filter((id) => id !== valueId),
        };
      }
    });
  }

  const [isLoading, setIsLoading] = useState(false);

  // Fungsi Validasi
  function validateOptions(): boolean {
    if (!data.options) return true;
    for (const option of data.options) {
      if (option.is_required) {
        const selected = selectedOptions[option.id];
        // Cek apakah belum dipilih atau array kosong
        if (!selected || selected.length === 0) {
          toast.error(`Mohon pilih varian ${option.option} terlebih dahulu.`);
          return false;
        }
      }
    }
    return true;
  }

  // Hitung Total Harga Real-time
  function calculateTotalPrice() {
    const basePrice = data.price;

    // Ambil semua ID values yang terpilih
    const allSelectedIds = Object.values(selectedOptions).flat();

    // Cari harga tambahannya
    const additionalPriceTotal = (data.options || [])
      .flatMap((opt) => opt.values)
      .filter((val) => allSelectedIds.includes(val.id))
      .reduce((acc, curr) => acc + (curr.additional_price || 0), 0);

    return (basePrice + additionalPriceTotal) * quantity;
  }

  async function handleAddToCart() {
    if (!validateOptions()) return;

    const allSelectedValueIds = Object.values(selectedOptions).flat();
    const originalCartId = activeCartId.current;
    const targetCartId = originalCartId || "temp-guest-cart";

    // Perform optimistic update
    const previousCart = queryClient.getQueryData(["cart", targetCartId]);

    const newCart: any = previousCart
      ? JSON.parse(JSON.stringify(previousCart))
      : { id: targetCartId, shop_carts: [] };

    let shopCart = newCart.shop_carts.find(
      (sc: any) => sc.shop.id === data.shop_id,
    );
    if (!shopCart) {
      shopCart = {
        id: "temp-shop-cart-" + Math.random().toString(),
        created_at: new Date().toISOString(),
        total_price: 0,
        shop: {
          id: data.shop_id,
          name: "Kedai",
        },
        _count: {
          items: 0,
        },
        items: [],
      };
      newCart.shop_carts.push(shopCart);
    }

    const selectedOptionsList: any[] = [];
    let totalOptionsPrice = 0;
    allSelectedValueIds.forEach((valId) => {
      data.options?.forEach((opt: any) => {
        const foundVal = opt.values?.find((v: any) => v.id === valId);
        if (foundVal) {
          selectedOptionsList.push({
            value: foundVal.value,
            product_option: {
              option: opt.option,
            },
          });
          totalOptionsPrice += foundVal.additional_price || 0;
        }
      });
    });

    const newItem = {
      id: "temp-cart-item-" + Math.random().toString(),
      quantity,
      subtotal: 0,
      product: {
        id: data.id,
        name: data.name,
        image_url: data.image_url,
        is_available: true,
      },
      selected_options: selectedOptionsList,
      _isNew: true,
      _basePriceSum: (data.price + totalOptionsPrice) * quantity,
    };
    shopCart.items.push(newItem);

    const totalCartQty = shopCart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const prevTotalCartQty = totalCartQty - quantity;

    const prevCommissionPerUnit = prevTotalCartQty > 2 ? 500 : 1000;
    const newCommissionPerUnit = totalCartQty > 2 ? 500 : 1000;

    let newTotalPrice = 0;
    shopCart.items.forEach((item: any) => {
      let basePriceSum = 0;
      if (item._isNew) {
        basePriceSum = item._basePriceSum;
      } else {
        const prevItemCommission = item.quantity * prevCommissionPerUnit;
        basePriceSum = item.subtotal - prevItemCommission;
      }
      item.subtotal = basePriceSum + (item.quantity * newCommissionPerUnit);
      newTotalPrice += item.subtotal;
    });

    shopCart.total_price = newTotalPrice;
    shopCart._count.items = shopCart.items.length;

    queryClient.setQueryData(["cart", targetCartId], newCart);

    if (!originalCartId) {
      if (typeof window !== "undefined") {
        localStorage.setItem("activeCartId", "temp-guest-cart");
      }
    }

    setIsLoading(true);

    try {
      let cartId = originalCartId;
      if (!cartId) {
        const { cartId: createdCartId } = await createGuestSession({
          name: "",
        });
        if (!createdCartId) {
          throw new Error("Gagal membuat sesi tamu, silakan coba lagi");
        }
        cartId = createdCartId;
        activeCartId.current = cartId;

        // Copy cache from temp-guest-cart to real cartId
        const tempCartData = queryClient.getQueryData(["cart", "temp-guest-cart"]);
        if (tempCartData) {
          const realCartData = {
            ...(tempCartData as any),
            id: cartId,
          };
          queryClient.setQueryData(["cart", cartId], realCartData);
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("activeCartId", cartId);
        }
        queryClient.removeQueries({ queryKey: ["cart", "temp-guest-cart"] });
      }

      const result = await addToCart({
        cartId: cartId!,
        shopId: data.shop_id,
        productId: data.id,
        quantity,
        selected_option_value_ids: allSelectedValueIds,
      });

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
        router.push(backUrl);
        router.refresh();
      } else {
        throw new Error(result.error.message || "Gagal menambahkan ke keranjang");
      }
    } catch (error: any) {
      // Rollback on error
      if (previousCart) {
        queryClient.setQueryData(["cart", targetCartId], previousCart);
      } else {
        queryClient.removeQueries({ queryKey: ["cart", targetCartId] });
      }
      if (!originalCartId) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("activeCartId");
        }
        queryClient.removeQueries({ queryKey: ["cart", "temp-guest-cart"] });
      }
      toast.error(error.message || "Terjadi kesalahan saat menambahkan ke keranjang");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      <div>
        <img
          src={getImageUrl("/product/" + data.image_url)}
          alt={data.name}
          className="h-full w-full rounded-lg shadow object-cover"
        />
      </div>

      <div>
        <CardTitle className="text-xl">{data.name}</CardTitle>
        <CardDescription className="text-lg">
          {data.description || ""}
        </CardDescription>
      </div>

      <div className="flex gap-2 items-center">
        <h1 className="flex gap-1 items-center">
          <Star className="w-4 h-4" />
          {data.average_rating || 0}
        </h1>

        <Dot />

        <h1 className="">Terjual {data._count?.order_items ?? 0}</h1>

        <Dot />

        <h1 className="text-primary ">{formatRupiah(data.price)}</h1>
      </div>

      {/* Render Options */}
      {data.options?.map((option) => (
        <div
          key={option.id}
          className="rounded-lg p-4 bg-accent/30 border border-accent"
        >
          <h1 className="font-medium">{option.option}</h1>

          <div className="flex gap-1 items-baseline mb-2">
            <h1 className="text-muted-foreground">
              {productOptionTypeMapping[option.type] || option.type}
            </h1>

            {option.is_required ? (
              <span className="text-red-500">(Wajib)</span>
            ) : (
              <span className="text-muted-foreground">(Opsional)</span>
            )}
          </div>

          {option.type === "MULTIPLE" ? (
            <div className="space-y-3 mt-2">
              {option.values.map((value) => {
                const isChecked =
                  selectedOptions[option.id]?.includes(value.id) || false;

                return (
                  <div key={value.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={value.id}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleMultipleChange(
                          option.id,
                          value.id,
                          checked as boolean,
                        )
                      }
                    />
                    <div className="flex w-full justify-between items-center">
                      <Label
                        htmlFor={value.id}
                        className="cursor-pointer text-md font-normal"
                      >
                        {value.value}
                      </Label>
                      {value.additional_price && value.additional_price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          + {formatRupiah(value.additional_price)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <RadioGroup
              value={selectedOptions[option.id]?.[0] || ""} // Ambil item pertama karena single
              onValueChange={(valueId) =>
                handleSingleChange(option.id, valueId)
              }
            >
              {option.values.map((value) => (
                <div key={value.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={value.id} id={value.id} />
                  <div className="flex w-full justify-between items-center">
                    <Label
                      htmlFor={value.id}
                      className="cursor-pointer mt-0.5 text-md font-normal"
                    >
                      {value.value}
                    </Label>
                    {value.additional_price && value.additional_price > 0 && (
                      <span className="text-sm text-muted-foreground">
                        + Rp{value.additional_price}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      ))}

      <div>
        <h1 className="font-semibold mb-2">Kuantitas</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        className="mt-2 py-6 flex justify-between items-center"
        onClick={handleAddToCart}
        disabled={isLoading}
        size={"lg"}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 w-full justify-center">
            <Loader2 className="animate-spin" />
            Menambahkan...
          </div>
        ) : (
          <>
            <h1>Tambah Ke Keranjang</h1>
            <h1>Rp{calculateTotalPrice()}</h1>
          </>
        )}
      </Button>
    </div>
  );
}
