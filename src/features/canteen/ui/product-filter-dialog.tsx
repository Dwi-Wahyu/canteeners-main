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
import { Filter, SlidersHorizontal } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";

export function ProductFilterDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const [minPriceQuery, setMinPriceQuery] = useQueryState("minimumPrice", {
    shallow: false,
    clearOnDefault: true,
  });

  const [maxPriceQuery, setMaxPriceQuery] = useQueryState("maximumPrice", {
    shallow: false,
    clearOnDefault: true,
  });

  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalMinPrice(minPriceQuery ?? "");
      setLocalMaxPrice(maxPriceQuery ?? "");
    }
  };

  const handleSave = async () => {
    await setMinPriceQuery(localMinPrice || null);
    await setMaxPriceQuery(localMaxPrice || null);
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
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </DialogTrigger>

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
          <Button variant="outline" onClick={handleReset} className="h-11">
            Reset
          </Button>
          <Button onClick={handleSave} className="h-11">
            <Filter />
            Terapkan Filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
