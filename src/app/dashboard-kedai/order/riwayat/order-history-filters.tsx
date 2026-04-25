"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function OrderHistoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  const currentStatus = searchParams.get("status") || "ALL";
  const currentDateFilter = searchParams.get("date") || "ALL";

  useEffect(() => {
    handleFilter("search", debouncedSearchValue);
  }, [debouncedSearchValue]);

  function handleFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama customer..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          value={currentStatus}
          onValueChange={(val) => handleFilter("status", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="COMPLETED">Selesai</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
            <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentDateFilter}
          onValueChange={(val) => handleFilter("date", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Waktu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Waktu</SelectItem>
            <SelectItem value="TODAY">Hari Ini</SelectItem>
            <SelectItem value="WEEK">Minggu Ini</SelectItem>
            <SelectItem value="MONTH">Bulan Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
