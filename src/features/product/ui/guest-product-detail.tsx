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
import { notificationDialog } from "@/hooks/use-notification-dialog";
import Link from "next/link";
import { formatRupiah } from "@/helper/format-rupiah";
import { GetProductById } from "../types/product-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { addToCart } from "@/features/cart/lib/cart-actions";
import { createGuestSession } from "@/helper/create-guest-session";

export default function GuestProductDetail({
  data,
  cartId: initialCartId,
}: {
  data: NonNullable<GetProductById>;
  cartId: string | undefined;
}) {
  // Gunakan State atau Ref untuk menyimpan cartId yang mungkin berubah dan butuh nilainya instan tanpa menunggu re-render untuk logika,
  // tapi useState juga oke jika ingin memicu UI update.
  const activeCartId = useRef(initialCartId);

  const [added, setAdded] = useState(false);

  // Update ref jika prop berubah (misal setelah refresh halaman)
  useEffect(() => {
    activeCartId.current = initialCartId;
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
    checked: boolean
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
    const additionalPriceTotal = data.options
      .flatMap((opt) => opt.values) // Gabungkan semua values dari semua options
      .filter((val) => allSelectedIds.includes(val.id)) // Ambil yang dipilih saja
      .reduce((acc, curr) => acc + (curr.additional_price || 0), 0); // Jumlahkan

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

      // Simpan ke Ref agar klik berikutnya menggunakan ID ini
      activeCartId.current = createdCartId;
    }

    const allSelectedValueIds = Object.values(selectedOptions).flat();

    const result = await addToCart({
      cartId: activeCartId.current,
      shopId: data.shop_id,
      productId: data.id,
      quantity,
      selected_option_value_ids: allSelectedValueIds,
    });

    if (result.success) {
      notificationDialog.success({
        title: "Sukses!",
        message: "Mau lanjut belanja atau langsung checkout?",
        actionButtons: (
          <div className="flex gap-2 justify-center">
            <Button onClick={notificationDialog.hide} variant={"outline"}>
              Lanjut Belanja
            </Button>
            <Link
              className="cursor-pointer"
              href={"/keranjang/" + result.data?.shopCartId}
              passHref
            >
              <Button variant="default" onClick={notificationDialog.hide}>
                Lihat Keranjang
              </Button>
            </Link>
          </div>
        ),
      });

      setAdded(true);
    } else {
      notificationDialog.error({
        title: "Gagal Tambahkan Ke Keranjang",
        message: "Coba lagi nanti",
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      <div>
        <img
          src={getImageUrl(data.image_url)}
          alt={data.name}
          className="h-full w-full rounded-lg shadow object-cover"
        />
      </div>

      <div>
        <CardTitle className="text-xl">{data.name}</CardTitle>
        <CardDescription className="text-lg">
          {data.description}
        </CardDescription>
      </div>

      <div className="flex gap-2 items-center">
        <h1 className="flex gap-1 items-center">
          <Star className="w-4 h-4" />
          {data.average_rating}
        </h1>

        <Dot />

        <h1 className="">Terjual {data._count.order_items}</h1>

        <Dot />

        <h1 className="text-primary ">{formatRupiah(data.price)}</h1>
      </div>

      {/* Render Options */}
      {data.options.map((option) => (
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
                          checked as boolean
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
        disabled={isLoading || added}
        size={"lg"}
      >
        {isLoading && (
          <div className="flex items-center gap-2 w-full justify-center">
            <Loader2 className="animate-spin" />
            Menambahkan...
          </div>
        )}

        {added && (
          <div className="flex items-center gap-2 justify-center w-full">
            <Check />
            <h1>Ditambahkan ke keranjang</h1>
          </div>
        )}

        {!added && !isLoading && (
          <>
            <h1>Tambah Ke Keranjang</h1>
            <h1>Rp{calculateTotalPrice()}</h1>
          </>
        )}
      </Button>
    </div>
  );
}
