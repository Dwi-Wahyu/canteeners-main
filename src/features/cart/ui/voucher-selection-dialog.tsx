"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Search,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Tag,
  AlertCircle,
  X,
} from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────── */
interface Voucher {
  id: string;
  discount: {
    name: string;
    description: string | null;
    value: number;
    type: "FIXED" | "PERCENTAGE";
    max_discount: number | null;
    min_purchase: number | null;
    status: string;
  };
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatValue(v: Voucher["discount"]): string {
  if (v.type === "PERCENTAGE") return `${v.value}%`;
  const raw = formatRupiah(v.value).replace("Rp\u00a0", "").replace(",00", "");
  return raw;
}

function valueFontSize(v: Voucher["discount"]): string {
  if (v.type === "PERCENTAGE") return v.value >= 100 ? "22px" : "28px";
  const digits = String(Math.round(v.value / 1000)).length;
  if (digits >= 4) return "16px";
  if (digits === 3) return "20px";
  return "26px";
}

/* ─── Global CSS (injected once) ────────────────────────────── */
const STYLES = `
  @keyframes voucher-float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-6px) rotate(1deg); }
  }
  @keyframes voucher-pulse-ring {
    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(227,36,43,0.4); }
    70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(227,36,43,0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(227,36,43,0); }
  }
  @keyframes voucher-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes voucher-check-in {
    0%   { opacity:0; transform: scale(0.5) rotate(-20deg); }
    60%  { transform: scale(1.15) rotate(4deg); }
    100% { opacity:1; transform: scale(1) rotate(0deg); }
  }
  @keyframes slide-up-fade {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .vd-liquid-bg {
    background: linear-gradient(145deg, #fff8f7 0%, #fff 40%, #ffecea 100%);
    position: relative;
    overflow: hidden;
  }
  .vd-liquid-bg::before {
    content:'';
    position:absolute;
    width:280px; height:280px;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    background: radial-gradient(circle, rgba(255,179,172,0.35) 0%, transparent 70%);
    top:-80px; left:-80px;
    pointer-events:none; z-index:0;
    animation: voucher-float 8s ease-in-out infinite;
  }
  .vd-liquid-bg::after {
    content:'';
    position:absolute;
    width:220px; height:220px;
    border-radius: 60% 40% 30% 70% / 60% 40% 70% 30%;
    background: radial-gradient(circle, rgba(227,36,43,0.08) 0%, transparent 70%);
    bottom:-60px; right:-60px;
    pointer-events:none; z-index:0;
    animation: voucher-float 10s ease-in-out 2s infinite;
  }

  /* Glass card */
  .vd-card {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    position: relative; z-index:1;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .vd-card:hover:not(.vd-card--invalid) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04);
  }
  .vd-card--applied {
    border-color: rgba(22,163,74,0.4);
    box-shadow: 0 0 0 3px rgba(22,163,74,0.08), 0 8px 32px rgba(0,0,0,0.07);
  }
  .vd-card--invalid {
    opacity: 0.55;
    filter: grayscale(30%);
  }

  /* Perforated divider */
  .vd-dashed {
    border-left: 2px dashed rgba(188,0,24,0.18);
    height: 75%;
  }

  /* Notch — positioned relative to the CARD so overflow:hidden clips both edges equally */
  .vd-notch {
    position:absolute;
    width:20px; height:20px;
    /* match liquid-bg so the visible half looks like a hole */
    background: #ffecea;
    border-radius: 50%;
    border: 1.5px solid rgba(255,220,216,0.7);
    box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
    z-index:10;
    /* horizontal center on the divider: value-pane(90px) + divider(20px) = 110px from right */
    right: calc(90px + 10px - 10px); /* = right: 90px, center of divider */
  }
  .vd-notch-t { top:-10px; }
  .vd-notch-b { bottom:-10px; }

  /* Value pane */
  .vd-value-pane {
    background: linear-gradient(145deg, rgba(255,218,214,0.5) 0%, rgba(255,240,238,0.3) 100%);
  }
  .vd-value-pane--applied {
    background: linear-gradient(145deg, rgba(209,250,229,0.5) 0%, rgba(236,253,245,0.3) 100%);
  }

  /* Shimmer on value text */
  .vd-shimmer {
    background: linear-gradient(90deg, #c9181f 0%, #ff6b6b 40%, #c9181f 60%, #8b0010 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: voucher-shimmer 3s linear infinite;
  }

  /* Applied check animation */
  .vd-check-anim {
    animation: voucher-check-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }

  /* Card entrance */
  .vd-card-enter {
    animation: slide-up-fade 0.3s ease forwards;
  }

  /* Trigger badge pulse */
  .vd-pulse {
    animation: voucher-pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite;
  }

  /* Search glow on focus */
  .vd-search-wrap:focus-within {
    border-color: rgba(227,36,43,0.35);
    box-shadow: 0 0 0 3px rgba(227,36,43,0.08), 0 4px 16px rgba(0,0,0,0.06);
  }

  /* Footer shimmer button */
  .vd-btn-done {
    background: linear-gradient(90deg, #e3242b 0%, #c9181f 50%, #e3242b 100%);
    background-size: 200% auto;
    transition: background-position 0.5s ease, transform 0.15s ease, box-shadow 0.15s ease;
  }
  .vd-btn-done:hover {
    background-position: right center;
    box-shadow: 0 6px 24px rgba(195,24,31,0.35);
  }
  .vd-btn-done:active {
    transform: scale(0.98);
  }

  /* Count badge */
  .vd-badge {
    background: linear-gradient(135deg, #e3242b, #c9181f);
    box-shadow: 0 2px 8px rgba(195,24,31,0.4);
  }
`;

/* ─── VoucherCard ────────────────────────────────────────────── */
function VoucherCard({
  v,
  isSelected,
  isInvalid,
  onToggle,
}: {
  v: Voucher;
  isSelected: boolean;
  isInvalid: boolean;
  onToggle: () => void;
}) {
  const d = v.discount;

  return (
    <div
      className={cn(
        "vd-card vd-card-enter rounded-2xl flex overflow-hidden relative",
        isSelected && "vd-card--applied",
        isInvalid && "vd-card--invalid",
      )}
    >
      {/* ── Left: Details ─────────────────────────── */}
      <div className="flex-1 p-4 flex flex-col justify-between gap-2 min-w-0">
        {/* Name + type badge */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Tag className="size-3 text-red-400 flex-shrink-0" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                {d.type === "FIXED" ? "Potongan" : "Diskon"}
              </span>
            </div>
            <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
              {d.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {d.description ||
            (d.min_purchase
              ? `Min. belanja ${formatRupiah(d.min_purchase)}`
              : "Tanpa minimum pembelian")}
        </p>

        {/* Min purchase warning */}
        {isInvalid && (
          <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1 w-fit">
            <AlertCircle className="size-3 text-red-500 flex-shrink-0" />
            <p className="text-[10px] text-red-500 font-bold">
              Min. {formatRupiah(d.min_purchase!)}
            </p>
          </div>
        )}

        {/* Max discount info */}
        {d.type === "PERCENTAGE" && d.max_discount && !isInvalid && (
          <p className="text-[10px] text-gray-400">
            Maks.{" "}
            <span className="font-semibold text-gray-600">
              {formatRupiah(d.max_discount)}
            </span>
          </p>
        )}

        {/* CTA */}
        <div>
          {isSelected ? (
            <button
              onClick={onToggle}
              className="group flex items-center gap-1.5 vd-check-anim px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-red-50 hover:border-red-300 transition-all duration-150 active:scale-95"
            >
              <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-500 flex-shrink-0 group-hover:hidden" />
              <X className="size-4 text-red-400 hidden group-hover:block flex-shrink-0" />
              <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest group-hover:hidden">
                Terpasang
              </span>
              <span className="text-[11px] font-extrabold text-red-500 uppercase tracking-widest hidden group-hover:block">
                Batalkan
              </span>
            </button>
          ) : (
            <button
              onClick={onToggle}
              disabled={isInvalid}
              className={cn(
                "text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-150",
                isInvalid
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-red-500 text-red-600 hover:bg-red-600 hover:text-white active:scale-95",
              )}
            >
              Gunakan
            </button>
          )}
        </div>
      </div>

      {/* ── Perforated Divider ────────────────────── */}
      <div className="relative flex items-center justify-center w-5 flex-shrink-0">
        <div className="vd-dashed" />
      </div>

      {/* Notches — children of card (overflow-hidden clips them at top & bottom equally) */}
      <span className="vd-notch vd-notch-t" />
      <span className="vd-notch vd-notch-b" />

      {/* ── Right: Value Pane ─────────────────────── */}
      <div
        className={cn(
          "w-[90px] flex-shrink-0 flex flex-col items-center justify-center gap-0.5 p-3 rounded-r-2xl",
          isSelected ? "vd-value-pane--applied" : "vd-value-pane",
        )}
      >
        {isSelected ? (
          /* Applied green value */
          <>
            <span
              className="font-black text-emerald-600 leading-none"
              style={{ fontSize: valueFontSize(d), letterSpacing: "-0.03em" }}
            >
              {formatValue(d)}
            </span>
            {d.type === "FIXED" && (
              <span className="text-[8px] font-black text-emerald-500 tracking-tighter leading-none">
                RIBU
              </span>
            )}
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-0.5">
              OFF
            </span>
          </>
        ) : (
          /* Normal red value */
          <>
            <span
              className="vd-shimmer font-black leading-none"
              style={{ fontSize: valueFontSize(d), letterSpacing: "-0.03em" }}
            >
              {formatValue(d)}
            </span>
            {d.type === "FIXED" && (
              <span className="text-[8px] font-black text-red-700 tracking-tighter leading-none">
                RIBU
              </span>
            )}
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider mt-0.5">
              OFF
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function VoucherSelectionDialog({
  vouchers,
  selectedIds,
  onToggle,
  totalPrice,
}: {
  vouchers: Voucher[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  totalPrice: number;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeVouchers = vouchers.filter((v) => v.discount.status === "ACTIVE");
  const filteredVouchers = activeVouchers.filter((v) =>
    v.discount.name.toLowerCase().includes(search.toLowerCase()),
  );

  const hasSelected = selectedIds.length > 0;

  return (
    <>
      <style>{STYLES}</style>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* ── Trigger Button ────────────────────────── */}
        <DialogTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between h-14 px-4 rounded-2xl transition-all duration-200 group",
              hasSelected
                ? "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 hover:border-red-300"
                : "bg-white/70 border-2 border-dashed border-gray-200 hover:border-red-200 hover:bg-red-50/30",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  hasSelected
                    ? "bg-red-500 vd-pulse"
                    : "bg-gray-100 group-hover:bg-red-50",
                )}
              >
                {hasSelected ? (
                  <Sparkles className="size-4 text-white" />
                ) : (
                  <Gift className="size-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                )}
              </div>
              <div className="text-left">
                <p
                  className={cn(
                    "font-bold text-sm leading-tight",
                    hasSelected ? "text-red-700" : "text-gray-700",
                  )}
                >
                  {hasSelected
                    ? `${selectedIds.length} Voucher Terpasang`
                    : "Gunakan Voucher"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {activeVouchers.length} voucher tersedia
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasSelected && (
                <span className="vd-badge text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  Aktif
                </span>
              )}
              <ChevronDown
                className={cn(
                  "size-4 transition-colors",
                  hasSelected ? "text-red-400" : "text-gray-300",
                )}
              />
            </div>
          </button>
        </DialogTrigger>

        {/* ── Modal ─────────────────────────────────── */}
        <DialogContent className="p-0 overflow-hidden rounded-[28px] border-none shadow-[0_32px_64px_rgba(0,0,0,0.2)] max-w-md w-full flex flex-col max-h-[88dvh] outline-none">
          <div className="vd-liquid-bg flex flex-col flex-1 min-h-0">
            {/* Header */}
            <DialogHeader className="relative z-50 flex-shrink-0">
              <div
                className="flex items-center justify-between px-5 h-16 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(110deg, #e3242b 0%, #c9181f 60%, #a8000e 100%)",
                  boxShadow: "0 6px 24px rgba(195,24,31,0.35)",
                }}
              >
                {/* Decorative circles in header */}
                <div
                  className="absolute right-12 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  }}
                />
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                  }}
                />
                {/* Spacer left */}
                <div className="w-10" />
                <DialogTitle className="font-extrabold text-[17px] tracking-tight text-white drop-shadow-sm">
                  Voucher Saya
                </DialogTitle>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-90"
                >
                  <X className="size-4 text-white" />
                </button>
              </div>
            </DialogHeader>

            {/* Count summary strip */}
            {hasSelected && (
              <div className="relative z-10 mx-5 -mb-1 mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0" />
                <p className="text-[11px] font-bold text-emerald-700">
                  {selectedIds.length} voucher aktif terpasang
                </p>
              </div>
            )}

            {/* Search Bar */}
            <div className="px-5 pt-4 pb-3 relative z-10">
              <div
                className="vd-search-wrap bg-white/85 backdrop-blur-sm rounded-2xl flex items-center px-4 py-3 border border-white/90 gap-3 transition-all duration-200"
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
              >
                <Search className="size-4 text-gray-400 flex-shrink-0" />
                <Input
                  ref={inputRef}
                  placeholder="Cari atau masukkan kode promo…"
                  className="flex-1 bg-transparent border-none outline-none focus-visible:ring-0 text-gray-800 text-sm placeholder:text-gray-400 p-0 h-auto shadow-none font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors flex-shrink-0"
                  >
                    <X className="size-3 text-gray-500" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Section label */}
            <div className="px-5 pb-2 relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {search
                  ? `${filteredVouchers.length} hasil ditemukan`
                  : `${activeVouchers.length} voucher tersedia`}
              </p>
            </div>

            {/* Voucher List */}
            <ScrollArea className="flex-1 min-h-0 px-5 pb-2 relative z-10">
              <div className="space-y-3 pb-2">
                {filteredVouchers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,218,214,0.5) 0%, rgba(255,255,255,0.7) 100%)",
                        border: "1.5px solid rgba(255,179,172,0.4)",
                        boxShadow:
                          "0 8px 24px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.8)",
                      }}
                    >
                      <Gift className="size-8 text-red-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">
                        Tidak ada voucher
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {search
                          ? "Coba kata kunci lain"
                          : "Belum ada voucher yang bisa digunakan"}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredVouchers.map((v, i) => {
                    const isSelected = selectedIds.includes(v.id);
                    const isInvalid = v.discount.min_purchase
                      ? totalPrice < v.discount.min_purchase
                      : false;
                    return (
                      <div key={v.id} style={{ animationDelay: `${i * 60}ms` }}>
                        <VoucherCard
                          v={v}
                          isSelected={isSelected}
                          isInvalid={isInvalid}
                          onToggle={() => onToggle(v.id)}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Sticky Footer */}
            <div
              className="px-5 py-4 relative z-20 flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.80)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderTop: "1.5px solid rgba(255,255,255,0.6)",
                boxShadow: "0 -12px 32px rgba(0,0,0,0.05)",
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="vd-btn-done w-full h-13 py-3.5 rounded-2xl font-extrabold text-[15px] text-white tracking-tight"
              >
                {hasSelected
                  ? `Selesai · ${selectedIds.length} Voucher`
                  : "Selesai"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
