"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { DollarSign, Filter, RotateCcw } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { ReactNode, useState } from "react";

/* ─── Responsive Drawer / Dialog Wrapper ──────────────────────── */
function ResponsiveFilterDialogWrapper({
  isOpen,
  onOpenChange,
  trigger,
  localMinPrice,
  setLocalMinPrice,
  localMaxPrice,
  setLocalMaxPrice,
  onSave,
  onReset,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  localMinPrice: string;
  setLocalMinPrice: (v: string) => void;
  localMaxPrice: string;
  setLocalMaxPrice: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const isMobile = useIsMobile();

  const presets = [
    { label: "< Rp 10rb", min: "", max: "10000" },
    { label: "Rp 10rb - 25rb", min: "10000", max: "25000" },
    { label: "> Rp 25rb", min: "25000", max: "" },
  ];

  const filterFormContent = (
    <div className="grid gap-5 py-4">
      {/* Presets */}
      <div className="grid gap-2">
        <Label className="text-xs font-semibold text-[#141d23]">
          Pilihan Cepat
        </Label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => {
            const isActive =
              localMinPrice === preset.min && localMaxPrice === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (isActive) {
                    setLocalMinPrice("");
                    setLocalMaxPrice("");
                  } else {
                    setLocalMinPrice(preset.min);
                    setLocalMaxPrice(preset.max);
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#bb0004]/10 border-[#bb0004] text-[#bb0004]"
                    : "bg-background border-input text-muted-foreground hover:bg-accent"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Price Input */}
      <div className="grid gap-2">
        <Label
          htmlFor="min-price"
          className="text-xs font-semibold text-[#141d23]"
        >
          Harga Minimum
        </Label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-xs font-semibold text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="min-price"
            type="number"
            placeholder="0"
            className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Max Price Input */}
      <div className="grid gap-2">
        <Label
          htmlFor="max-price"
          className="text-xs font-semibold text-[#141d23]"
        >
          Harga Maksimum
        </Label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-xs font-semibold text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="max-price"
            type="number"
            placeholder="1000000"
            className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerHeader className="text-left px-0 pt-0">
            <DrawerTitle>Filter Range Harga</DrawerTitle>
            <DrawerDescription>
              Tentukan rentang harga produk yang ingin ditampilkan.
            </DrawerDescription>
          </DrawerHeader>
          {filterFormContent}
          <DrawerFooter className="px-0 pb-2 pt-2 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onReset}
              className="h-11 cursor-pointer"
            >
              Reset
            </Button>
            <Button
              onClick={onSave}
              className="h-11 bg-[#bb0004] hover:bg-[#a00003] text-white cursor-pointer"
            >
              Terapkan Filter
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Range Harga</DialogTitle>
          <DialogDescription>
            Tentukan rentang harga produk yang ingin ditampilkan.
          </DialogDescription>
        </DialogHeader>
        {filterFormContent}
        <DialogFooter className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            className="h-11 cursor-pointer"
          >
            Reset
          </Button>
          <Button
            onClick={onSave}
            className="h-11 bg-[#bb0004] hover:bg-[#a00003] text-white cursor-pointer"
          >
            Terapkan Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Original standalone button ──────────────────────────────── */
export function ProductFilterDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [minPriceQuery, setMinPriceQuery] = useQueryState(
    "minimumPrice",
    parseAsInteger.withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [maxPriceQuery, setMaxPriceQuery] = useQueryState(
    "maximumPrice",
    parseAsInteger.withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalMinPrice(
        minPriceQuery !== null && minPriceQuery !== undefined
          ? minPriceQuery.toString()
          : "",
      );
      setLocalMaxPrice(
        maxPriceQuery !== null && maxPriceQuery !== undefined
          ? maxPriceQuery.toString()
          : "",
      );
    }
  };

  const handleSave = async () => {
    const minVal =
      localMinPrice.trim() !== "" ? parseInt(localMinPrice, 10) : null;
    const maxVal =
      localMaxPrice.trim() !== "" ? parseInt(localMaxPrice, 10) : null;

    const validMin =
      minVal !== null && !isNaN(minVal) && minVal >= 0 ? minVal : null;
    const validMax =
      maxVal !== null && !isNaN(maxVal) && maxVal >= 0 ? maxVal : null;

    await setMinPriceQuery(validMin);
    await setMaxPriceQuery(validMax);
    setIsOpen(false);
  };

  const handleReset = async () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    await setMinPriceQuery(null);
    await setMaxPriceQuery(null);
    setIsOpen(false);
  };

  const trigger = (
    <Button
      variant="outline"
      size="icon-lg"
      className="shrink-0 cursor-pointer"
    >
      <DollarSign className="w-5 h-5 text-[#bb0004]" />
    </Button>
  );

  return (
    <ResponsiveFilterDialogWrapper
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      localMinPrice={localMinPrice}
      setLocalMinPrice={setLocalMinPrice}
      localMaxPrice={localMaxPrice}
      setLocalMaxPrice={setLocalMaxPrice}
      onSave={handleSave}
      onReset={handleReset}
    />
  );
}

/* ─── Inline trigger (icon inside search bar) ─────────────────── */
export function ProductFilterDialogInline() {
  const [isOpen, setIsOpen] = useState(false);
  const [minPriceQuery, setMinPriceQuery] = useQueryState(
    "minimumPrice",
    parseAsInteger.withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [maxPriceQuery, setMaxPriceQuery] = useQueryState(
    "maximumPrice",
    parseAsInteger.withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");

  const hasFilter =
    (minPriceQuery !== null && minPriceQuery > 0) ||
    (maxPriceQuery !== null && maxPriceQuery > 0);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalMinPrice(
        minPriceQuery !== null && minPriceQuery !== undefined
          ? minPriceQuery.toString()
          : "",
      );
      setLocalMaxPrice(
        maxPriceQuery !== null && maxPriceQuery !== undefined
          ? maxPriceQuery.toString()
          : "",
      );
    }
  };

  const handleSave = async () => {
    const minVal =
      localMinPrice.trim() !== "" ? parseInt(localMinPrice, 10) : null;
    const maxVal =
      localMaxPrice.trim() !== "" ? parseInt(localMaxPrice, 10) : null;

    const validMin =
      minVal !== null && !isNaN(minVal) && minVal >= 0 ? minVal : null;
    const validMax =
      maxVal !== null && !isNaN(maxVal) && maxVal >= 0 ? maxVal : null;

    await setMinPriceQuery(validMin);
    await setMaxPriceQuery(validMax);
    setIsOpen(false);
  };

  const handleReset = async () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    await setMinPriceQuery(null);
    await setMaxPriceQuery(null);
    setIsOpen(false);
  };

  const trigger = (
    <button
      type="button"
      className="relative flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#d0dcea] transition-colors active:scale-90 shrink-0 cursor-pointer"
      aria-label="Filter harga"
    >
      {hasFilter && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#bb0004] rounded-full border-2 border-white" />
      )}
      <DollarSign className="w-4 h-4 text-[#bb0004]" />
    </button>
  );

  return (
    <ResponsiveFilterDialogWrapper
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      localMinPrice={localMinPrice}
      setLocalMinPrice={setLocalMinPrice}
      localMaxPrice={localMaxPrice}
      setLocalMaxPrice={setLocalMaxPrice}
      onSave={handleSave}
      onReset={handleReset}
    />
  );
}
