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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Filter } from "lucide-react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useState } from "react";

/* ─── Shared dialog content ────────────────────────────────────── */
function FilterDialogContent({
  localMinPrice,
  setLocalMinPrice,
  localMaxPrice,
  setLocalMaxPrice,
  onSave,
  onReset,
}: {
  localMinPrice: string;
  setLocalMinPrice: (v: string) => void;
  localMaxPrice: string;
  setLocalMaxPrice: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Sesuaikan Harga</DialogTitle>
        <DialogDescription>
          Tentukan rentang harga produk yang ingin ditampilkan.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-5 py-4">
        <div className="grid gap-2">
          <Label htmlFor="min-price">Harga Minimum</Label>
          <Input
            id="min-price"
            type="number"
            placeholder="0"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="max-price">Harga Maksimum</Label>
          <Input
            id="max-price"
            type="number"
            placeholder="1000000"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={onReset} className="h-11">
          Reset
        </Button>
        <Button onClick={onSave} className="h-11">
          <Filter />
          Terapkan Filter
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/* ─── Original standalone button ──────────────────────────────── */
export function ProductFilterDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [minPriceQuery, setMinPriceQuery] = useQueryState(
    "minimumPrice",
    parseAsInteger
      .withDefault(0)
      .withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [maxPriceQuery, setMaxPriceQuery] = useQueryState(
    "maximumPrice",
    parseAsInteger
      .withDefault(0)
      .withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalMinPrice(minPriceQuery?.toString() ?? "");
      setLocalMaxPrice(maxPriceQuery?.toString() ?? "");
    }
  };

  const handleSave = async () => {
    await setMinPriceQuery(parseInt(localMinPrice) || null);
    await setMaxPriceQuery(parseInt(localMaxPrice) || null);
    setIsOpen(false);
  };

  const handleReset = async () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    await setMinPriceQuery(null);
    await setMaxPriceQuery(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
          >
            <path
              fill="#E4272A"
              d="M11 5C9.363 5 8.137 6.21 7.312 7.563C6.489 8.913 6 10.515 6 12c0 2.582 1.781 4.465 4 4.906V28h2V16.906c2.219-.441 4-2.324 4-4.906c0-1.484-.488-3.086-1.313-4.438C13.864 6.212 12.637 5 11 5m7 0v7c0 1.852 1.281 3.398 3 3.844V28h2V15.844c1.719-.446 3-1.992 3-3.844V5h-2v7c0 1.117-.883 2-2 2s-2-.883-2-2V5zm3 0v7c0 .55.45 1 1 1s1-.45 1-1V5zM11 7c.574 0 1.344.566 1.969 1.594C13.594 9.62 14 10.996 14 12c0 2.004-1.25 3-3 3s-3-.996-3-3c0-1.004.406-2.379 1.031-3.406S10.426 7 11 7"
            />
          </svg>
        </Button>
      </DialogTrigger>
      <FilterDialogContent
        localMinPrice={localMinPrice}
        setLocalMinPrice={setLocalMinPrice}
        localMaxPrice={localMaxPrice}
        setLocalMaxPrice={setLocalMaxPrice}
        onSave={handleSave}
        onReset={handleReset}
      />
    </Dialog>
  );
}

/* ─── Inline trigger (icon inside search bar) ─────────────────── */
export function ProductFilterDialogInline() {
  const [isOpen, setIsOpen] = useState(false);
  const [minPriceQuery, setMinPriceQuery] = useQueryState(
    "minimumPrice",
    parseAsInteger
      .withDefault(0)
      .withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [maxPriceQuery, setMaxPriceQuery] = useQueryState(
    "maximumPrice",
    parseAsInteger
      .withDefault(0)
      .withOptions({ shallow: false, clearOnDefault: true }),
  );
  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");

  const hasFilter = (minPriceQuery ?? 0) > 0 || (maxPriceQuery ?? 0) > 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalMinPrice(minPriceQuery?.toString() ?? "");
      setLocalMaxPrice(maxPriceQuery?.toString() ?? "");
    }
  };

  const handleSave = async () => {
    await setMinPriceQuery(parseInt(localMinPrice) || null);
    await setMaxPriceQuery(parseInt(localMaxPrice) || null);
    setIsOpen(false);
  };

  const handleReset = async () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    await setMinPriceQuery(null);
    await setMaxPriceQuery(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="relative flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#d0dcea] transition-colors active:scale-90 flex-shrink-0"
          aria-label="Filter harga"
        >
          {/* Active dot */}
          {hasFilter && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#bb0004] rounded-full border border-white" />
          )}
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 32 32"
          >
            <path
              fill="#E4272A"
              d="M11 5C9.363 5 8.137 6.21 7.312 7.563C6.489 8.913 6 10.515 6 12c0 2.582 1.781 4.465 4 4.906V28h2V16.906c2.219-.441 4-2.324 4-4.906c0-1.484-.488-3.086-1.313-4.438C13.864 6.212 12.637 5 11 5m7 0v7c0 1.852 1.281 3.398 3 3.844V28h2V15.844c1.719-.446 3-1.992 3-3.844V5h-2v7c0 1.117-.883 2-2 2s-2-.883-2-2V5zm3 0v7c0 .55.45 1 1 1s1-.45 1-1V5zM11 7c.574 0 1.344.566 1.969 1.594C13.594 9.62 14 10.996 14 12c0 2.004-1.25 3-3 3s-3-.996-3-3c0-1.004.406-2.379 1.031-3.406S10.426 7 11 7"
            />
          </svg> */}

          <DollarSign className="w-4 h-4 text-primary" />
        </button>
      </DialogTrigger>
      <FilterDialogContent
        localMinPrice={localMinPrice}
        setLocalMinPrice={setLocalMinPrice}
        localMaxPrice={localMaxPrice}
        setLocalMaxPrice={setLocalMaxPrice}
        onSave={handleSave}
        onReset={handleReset}
      />
    </Dialog>
  );
}
