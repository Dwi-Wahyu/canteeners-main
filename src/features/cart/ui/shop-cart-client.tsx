"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";

import { PaymentMethod, PostOrderType } from "@/generated/prisma";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { formatRupiah } from "@/helper/format-rupiah";
import SnkCheckoutDialog from "@/features/cart/ui/snk-checkout-dialog";
import PostOrderTypeTab from "@/features/cart/ui/post-order-type-tab";
import { processShopCart } from "@/features/cart/lib/cart-actions";
import ShopCartPaymentMethod from "@/features/cart/ui/shop-cart-payment-method";
import NavButton from "@/components/nav-button";
import { GetCustomerProfileType } from "@/features/user/types/user-queries-types";
import { GuestDetailsFormDialog } from "./guest-details-form-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Store,
  Loader2,
  Pencil,
  StickyNote,
  Trash2,
  CircleAlert,
  ShieldAlert,
  Coffee,
} from "lucide-react";
import { formatToHour, isTimeWithinRange } from "@/helper/hour-helper";
import ReferralSection from "./referral-section";
import { toast } from "sonner";
import { useRouter } from "nextjs-toploader/app";
import VoucherSelectionDialog from "./voucher-selection-dialog";
import { calculateCommission } from "@/helper/pricing-helper";
import { getImageUrl } from "@/helper/get-image-url";
import { Input } from "@/components/ui/input";
import {
  changeCartItemDetails,
  deleteCartItem,
} from "@/features/cart/lib/cart-actions";
import {
  GetShopCartType,
  GetShopCartItemType,
} from "../types/cart-queries-types";
import { cn } from "@/lib/utils";

function CartItemRow({
  item,
  shopCartId,
  isLocked,
  isLastItem,
}: {
  item: GetShopCartItemType;
  shopCartId: string;
  isLocked: boolean;
  isLastItem: boolean;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(item.quantity);
  const [isPending, startTransition] = useTransition();

  const isAvailable = (item.product as any).is_available;

  async function handleDeleteItem() {
    // Tidak boleh hapus jika cart dikunci atau ini item terakhir
    if (isLocked || isLastItem) return;

    startTransition(async () => {
      const result = await deleteCartItem(item.id);

      if (result.success) {
        // toast.success("Item dihapus");
        router.refresh();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  async function handleChangeQuantity(newQty: number) {
    if (newQty < 1 || !isAvailable || isLocked) return;

    setQty(newQty);

    startTransition(async () => {
      const result = await changeCartItemDetails({
        id: item.id,
        quantity: newQty,
        note: item.note,
      });

      if (result.success) {
        // toast.success("Perubahan disimpan");
        router.refresh();
      } else {
        // toast.error("Gagal menyimpan perubahan");
        setQty(item.quantity);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 py-3 border-b last:border-0">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          {item.selected_options.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {item.selected_options
                .map((opt) => `${opt.product_option.option}: ${opt.value}`)
                .join(", ")}
            </p>
          )}
          {item.note && (
            <div className="flex gap-1 items-center text-xs text-muted-foreground">
              <StickyNote className="w-3 h-3" />
              <p>{item.note}</p>
            </div>
          )}
          <p className="font-medium text-sm">{formatRupiah(item.subtotal)}</p>
        </div>

        <div className="flex gap-1">
          <Link href={`/keranjang/${shopCartId}/${item.id}`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              disabled={isLocked || !isAvailable}
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-red-50 group transition-colors"
            onClick={handleDeleteItem}
            disabled={isLocked || isPending || isLastItem}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleChangeQuantity(qty - 1)}
          disabled={qty <= 1 || isPending || isLocked || !isAvailable}
        >
          -
        </Button>
        <Input
          type="number"
          value={qty}
          onChange={(e) => handleChangeQuantity(Number(e.target.value))}
          className="w-12 h-8 text-center p-0 text-xs"
          min={1}
          disabled={isPending || isLocked || !isAvailable}
        />
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleChangeQuantity(qty + 1)}
          disabled={isPending || isLocked || !isAvailable}
        >
          +
        </Button>
      </div>
    </div>
  );
}

export default function ShopCartClient({
  userId,
  shopCart,
  customerProfile,
  nameAlreadySet,
}: {
  userId: string;
  shopCart: GetShopCartType;
  customerProfile: GetCustomerProfileType & {
    user: { username: string | null };
    has_used_referral: boolean;
  };
  nameAlreadySet: boolean;
}) {
  const router = useRouter();
  const [showSnk, setShowSnk] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    shopCart.payment_method,
  );

  const [checkouted, setCheckouted] = useState(false);
  const [showGuestDetailsFormDialog, setShowGuestDetailsFormDialog] =
    useState(false);

  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [selectedDiscountIds, setSelectedDiscountIds] = useState<string[]>([]);

  const isGuest = !customerProfile.user.username;

  const handleApplyReferral = (code: string) => {
    setAppliedCode(code);
  };

  const removeReferral = () => {
    setAppliedCode(null);
  };

  const toggleDiscount = (cdId: string) => {
    if (selectedDiscountIds.includes(cdId)) {
      setSelectedDiscountIds(selectedDiscountIds.filter((id) => id !== cdId));
    } else {
      setSelectedDiscountIds([...selectedDiscountIds, cdId]);
    }
  };

  const totalQty = shopCart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCommission = calculateCommission(totalQty);
  const itemsOnlyTotal = shopCart.total_price - totalCommission;

  const ITEM_ONLY_DISCOUNT_CODES = ["EVENT_REWARD_VOUCHER"];

  // Hitung total potongan dari voucher yang dipilih
  const finalDiscount = (customerProfile.discounts || [])
    .filter((cd) => selectedDiscountIds.includes(cd.id))
    .reduce((sum, cd: any) => {
      const isItemOnly =
        cd.discount.code && ITEM_ONLY_DISCOUNT_CODES.includes(cd.discount.code);
      const discountBase = isItemOnly ? itemsOnlyTotal : shopCart.total_price;

      let amount = 0;
      if (cd.discount.type === "FIXED") {
        amount = cd.discount.value;
      } else {
        const pct = (discountBase * cd.discount.value) / 100;
        amount = cd.discount.max_discount
          ? Math.min(pct, cd.discount.max_discount)
          : pct;
      }

      // Cap discount by base to protect commission for item-only vouchers
      if (isItemOnly && amount > itemsOnlyTotal) {
        amount = itemsOnlyTotal;
      }

      return sum + amount;
    }, 0);

  const [postOrderType, setPostOrderType] = useState<PostOrderType>(
    shopCart.post_order_type,
  );

  function handleClickCheckout() {
    // Jika belum set nama / masih default = ""
    if (
      postOrderType === "DELIVERY_TO_TABLE" &&
      customerProfile.table_number === null
    ) {
      toast.error("Tolong pilih nomor meja");
      return;
    }

    const isNameInvalid =
      !customerProfile.user.name || customerProfile.user.name === "Tamu";

    if (isGuest && isNameInvalid) {
      setShowGuestDetailsFormDialog(true);
    } else {
      setShowSnk(true);
    }
  }

  function saveGuestDetails() {
    setShowSnk(true);
  }

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (checkouted) {
      startTransition(async () => {
        const result = await processShopCart({
          shopCartId: shopCart.id,
          paymentMethod,
          postOrderType,
          floor: customerProfile.floor,
          table_number: customerProfile.table_number,
          referralCode: appliedCode || undefined,
          appliedCustomerDiscountIds: selectedDiscountIds,
        });

        if (result.success) {
          setShowSnk(false);

          notificationDialog.success({
            title: "Sukses checkout keranjang",
            message: "Order berhasil dicatat, mengalihkan ke detail order...",
            showLoadingBar: true,
          });

          if (result.data) {
            setTimeout(() => {
              notificationDialog.hide();
              router.push("/order/" + result.data?.order_id);
            }, 2000);
          }
        } else {
          notificationDialog.error({
            title: "Gagal checkout keranjang",
            message: result.error.message,
          });
        }
      });
    }
  }, [checkouted]);

  const now = new Date();
  const { status, open_time, close_time, suspended_reason } = shopCart.shop;

  // Apakah di luar jam operasional
  const isOutsideHours =
    open_time && close_time && !isTimeWithinRange(now, open_time, close_time);

  // Apakah status memang tidak aktif (Manual/Sistem)
  const isNotActive = status !== "ACTIVE";

  // Apakah kedai sedang sibuk
  const isBusy = status === "BUSY";

  // Apakah ada item yang tidak tersedia
  const hasUnavailableItem = shopCart.items.some(
    (item: any) => !item.product.is_available,
  );

  // Apakah kedai benar-benar bisa menerima order
  const canOrder = !isNotActive && !isOutsideHours && !hasUnavailableItem && !isBusy;

  const isSuspended =
    customerProfile.suspend_until !== null &&
    new Date(customerProfile.suspend_until) > new Date();

  const groupedItems = shopCart.items.reduce(
    (acc, item) => {
      const productName = item.product.name;
      if (!acc[productName]) {
        acc[productName] = [];
      }
      acc[productName].push(item);
      return acc;
    },
    {} as Record<string, GetShopCartItemType[]>,
  );

  return (
    <div className="flex flex-col gap-4">
      {isSuspended && (
        <Alert variant="destructive">
          <ShieldAlert className="w-4 h-4" />
          <AlertTitle>Akun Dibekukan</AlertTitle>
          <AlertDescription>
            {customerProfile.suspend_reason ||
              "Akun Anda sedang dibekukan sementara karena pelanggaran kebijakan."}
          </AlertDescription>
        </Alert>
      )}

      {isBusy && (
        <Alert className="border-orange-200 bg-orange-50 text-orange-900">
          <Coffee className="w-4 h-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Kedai Sedang Sibuk</AlertTitle>
          <AlertDescription className="text-orange-700">
            Maaf, kedai sedang sangat ramai dan menutup pesanan baru untuk
            sementara. Silakan coba beberapa saat lagi.
          </AlertDescription>
        </Alert>
      )}

      {!canOrder && !isBusy && (
        <Alert
          variant={
            status === "SUSPENDED" || hasUnavailableItem
              ? "destructive"
              : "default"
          }
        >
          {hasUnavailableItem ? <CircleAlert /> : <Store />}
          <AlertTitle>
            {status === "SUSPENDED"
              ? "Kedai Ditangguhkan"
              : hasUnavailableItem
                ? "Item Tidak Tersedia"
                : "Kedai Sedang Tutup"}
          </AlertTitle>
          <AlertDescription>
            {status === "SUSPENDED" ? (
              <span>
                {suspended_reason ||
                  "Kedai ini sementara tidak dapat menerima pesanan."}
              </span>
            ) : hasUnavailableItem ? (
              <span>
                Ada item di keranjang Anda yang saat ini tidak tersedia. Silakan
                hapus item tersebut untuk melanjutkan checkout. Jika tidak bisa
                dihapus silakan tambahkan item lain untuk bisa checkout kemudian
                hapus item yang tidak tersedia.
              </span>
            ) : status === "INACTIVE" ? (
              <span>
                Kedai sedang beristirahat sejenak. Silakan cek kembali nanti.
              </span>
            ) : isOutsideHours ? (
              <span>
                Buka kembali pukul <strong>{formatToHour(open_time)}</strong>.
                (Jam operasional: {formatToHour(open_time)} -{" "}
                {formatToHour(close_time)})
              </span>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <div className="">
        <h1 className="font-semibold mb-2">Daftar Pesanan</h1>

        <div className="flex flex-col pb-1 gap-2">
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedItems).map(([productName, items], idx) => {
              const firstItem = items[0];
              const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
              const totalSubtotal = items.reduce(
                (sum, i) => sum + i.subtotal,
                0,
              );

              const isAvailable = (firstItem.product as any).is_available;

              return (
                <AccordionItem
                  value={`item-${idx}`}
                  key={idx}
                  className={cn(
                    "border rounded-lg px-4 mb-2 last:border-b",
                    !isAvailable && "bg-red-50/50 border-red-200",
                  )}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <img
                          src={getImageUrl(
                            "/product/" + firstItem.product.image_url,
                          )}
                          alt={productName}
                          className={cn(
                            "rounded-lg object-cover aspect-square w-16 h-16",
                            !isAvailable && "grayscale",
                          )}
                          onError={(e) =>
                            (e.currentTarget.src = "/placeholder-image.webp")
                          }
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        {!isAvailable && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-sm w-fit font-bold mb-1">
                            Tidak Tersedia
                          </span>
                        )}
                        <h1
                          className={cn(
                            "font-semibold",
                            !isAvailable && "text-red-900",
                          )}
                        >
                          {productName}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          {totalQty} Item • {formatRupiah(totalSubtotal)}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col">
                      {items.map((item) => (
                        <CartItemRow
                          key={item.id}
                          item={item}
                          shopCartId={shopCart.id}
                          isLocked={shopCart.order_id !== null}
                          isLastItem={shopCart.items.length === 1}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>

      {shopCart.order_id === null && (
        <div className="flex justify-between ">
          <div>
            <h1 className="font-semibold">Ada lagi yang mau dibeli?</h1>
            <h1 className="text-muted-foreground text-sm">
              Masih bisa tambah menu lain
            </h1>
          </div>

          <NavButton href={`/kedai/${shopCart.shop.id}`} variant={"outline"}>
            Tambah
          </NavButton>
        </div>
      )}

      <ShopCartPaymentMethod
        shopPayments={shopCart.shop.payments}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        disabled={shopCart.order_id !== null}
      />
      <PostOrderTypeTab
        canteen_name={shopCart.shop.canteen.name}
        customerProfile={customerProfile}
        postOrderType={postOrderType}
        setPostOrderType={setPostOrderType}
        selectTablePageUrl={`/kantin/${shopCart.shop.canteen.slug}/pilih-meja?callbackUrl=/keranjang/${shopCart.id}`}
      />

      {!isGuest && !customerProfile.has_used_referral && (
        <ReferralSection
          appliedCode={appliedCode}
          onApply={handleApplyReferral}
          onRemove={removeReferral}
        />
      )}

      {!isGuest && (
        <VoucherSelectionDialog
          vouchers={
            (customerProfile.discounts || []).filter((d) => !d.is_used) as any
          }
          selectedIds={selectedDiscountIds}
          onToggle={toggleDiscount}
          totalPrice={shopCart.total_price}
        />
      )}

      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-sm">Ringkasan Harga</h1>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <h1>Total Harga Menu ({totalQty} Item)</h1>
          <h1>{formatRupiah(itemsOnlyTotal)}</h1>
        </div>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex flex-col">
            <h1>Total Biaya Layanan</h1>
            <span className="text-[10px]">
              Potongan 50% jika total lebih dari 2 item
            </span>
          </div>
          <h1>{formatRupiah(totalCommission)}</h1>
        </div>

        {finalDiscount > 0 && (
          <div className="flex justify-between items-center text-sm text-blue-600 font-semibold animate-in slide-in-from-right-2 duration-300">
            <h1>Total Potongan</h1>
            <h1>-{formatRupiah(finalDiscount)}</h1>
          </div>
        )}

        <div className="flex font-bold justify-between items-center text-gray-900 mt-1 border-t pt-3">
          <h1>Total Pembayaran</h1>
          <h1 className="text-lg text-primary">
            {formatRupiah(shopCart.total_price - finalDiscount)}
          </h1>
        </div>
      </div>

      {shopCart.order_id !== null && (
        <div className="flex flex-col gap-4">
          <Button className="py-6" size={"lg"} asChild>
            <Link href={"/order/" + shopCart.order_id}>Lihat Detail Order</Link>
          </Button>

          <Button className="py-6" size={"lg"} asChild>
            <Link
              href={
                "/chat/" +
                `${customerProfile.user_id}_${shopCart.shop.owner.user_id}`
              }
            >
              Hubungi Pemilik Kedai
            </Link>
          </Button>
        </div>
      )}

      {shopCart.order_id === null && (
        <Button
          className="w-full bg-linear-to-t from-primary to-primary/80 border border-primary flex justify-between py-6 items-center"
          size={"lg"}
          onClick={handleClickCheckout}
          disabled={
            isSuspended ||
            !canOrder ||
            isPending ||
            (postOrderType === "DELIVERY_TO_TABLE" &&
              customerProfile.table_number === null)
          }
        >
          <h1>{shopCart.items.length} Item</h1>

          <div className="flex gap-2 h-4">
            <h1>{formatRupiah(shopCart.total_price - finalDiscount)}</h1>

            <Separator orientation="vertical" />

            <h1 className="font-semibold">Checkout</h1>
          </div>
        </Button>
      )}

      <GuestDetailsFormDialog
        userId={userId}
        setShowGuestDetailsFormDialog={setShowGuestDetailsFormDialog}
        showGuestDetailsFormDialog={showGuestDetailsFormDialog}
        saveGuestDetails={saveGuestDetails}
      />

      <SnkCheckoutDialog
        showSnk={showSnk}
        setShowSnk={setShowSnk}
        setCheckouted={setCheckouted}
        isCheckoutPending={isPending}
      />
    </div>
  );
}
