"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomerOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [showFilters, setShowFilters] = useState(!!(startDate || endDate));

  function handleFilter() {
    const params = new URLSearchParams(searchParams.toString());
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");

    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");

    params.set("page", "1"); // Reset to page 1

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleReset() {
    setStartDate("");
    setEndDate("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("startDate");
    params.delete("endDate");
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Filter Pesanan
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 text-[10px] font-bold gap-1.5 rounded-full px-3",
            showFilters ? "text-primary bg-primary/5" : "text-muted-foreground",
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={12} />
          {showFilters ? "Tutup Filter" : "Atur Tanggal"}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 rounded-xl text-xs bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 rounded-xl text-xs bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl text-xs font-bold"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button
              className="flex-1 h-10 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10"
              onClick={handleFilter}
              disabled={isPending}
            >
              Terapkan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
