"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, ChevronRight, Ticket, X, Tag, Sparkles } from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface UserVoucher {
  id: string;
  name: string;
  value: number;
  type: "FIXED" | "PERCENTAGE";
  description: string | null;
  status: string;
}

function formatValue(v: UserVoucher): string {
  if (v.type === "PERCENTAGE") return `${v.value}%`;
  return formatRupiah(v.value).replace("Rp\u00a0", "").replace(",00", "");
}

function valueFontSize(v: UserVoucher): string {
  if (v.type === "PERCENTAGE") return v.value >= 100 ? "22px" : "28px";
  const digits = String(Math.round(v.value / 1000)).length;
  if (digits >= 4) return "16px";
  if (digits === 3) return "20px";
  return "26px";
}

const STYLES = `
  @keyframes uvs-float {
    0%,100% { transform: translateY(0px) rotate(0deg); }
    50%      { transform: translateY(-5px) rotate(1deg); }
  }
  @keyframes uvs-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes uvs-slide-in {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .uvs-liquid-bg {
    background: linear-gradient(145deg, #fff8f7 0%, #fff 40%, #ffecea 100%);
    position: relative;
    overflow: hidden;
  }
  .uvs-liquid-bg::before {
    content:'';
    position:absolute;
    width:250px; height:250px;
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    background: radial-gradient(circle, rgba(255,179,172,0.35) 0%, transparent 70%);
    top:-70px; left:-70px;
    pointer-events:none; z-index:0;
    animation: uvs-float 8s ease-in-out infinite;
  }
  .uvs-liquid-bg::after {
    content:'';
    position:absolute;
    width:200px; height:200px;
    border-radius: 60% 40% 30% 70% / 60% 40% 70% 30%;
    background: radial-gradient(circle, rgba(227,36,43,0.07) 0%, transparent 70%);
    bottom:-50px; right:-50px;
    pointer-events:none; z-index:0;
    animation: uvs-float 10s ease-in-out 2s infinite;
  }

  .uvs-card {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1.5px solid rgba(255,255,255,0.9);
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    animation: uvs-slide-in 0.3s ease forwards;
  }
  .uvs-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.09);
  }
  .uvs-dashed {
    border-left: 2px dashed rgba(188,0,24,0.18);
    height: 72%;
  }
  .uvs-notch {
    position:absolute;
    background: #ffecea;
    border-radius: 50%;
    border: 1.5px solid rgba(255,220,216,0.7);
    box-shadow: inset 0 1px 4px rgba(0,0,0,0.08);
    z-index:10;
    width:18px; height:18px;
    /* horizontal center on divider: value-pane(88px) + divider(20px) = 108px from right */
    right: 88px;
  }
  .uvs-notch-t { top:-9px; }
  .uvs-notch-b { bottom:-9px; }

  .uvs-shimmer {
    background: linear-gradient(90deg, #c9181f 0%, #ff6b6b 40%, #c9181f 60%, #8b0010 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: uvs-shimmer 3s linear infinite;
  }
  .uvs-value-pane {
    background: linear-gradient(145deg, rgba(255,218,214,0.5) 0%, rgba(255,240,238,0.3) 100%);
  }
`;

export default function UserVouchersSection({
  vouchers,
}: {
  vouchers: UserVoucher[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeVouchers = (vouchers || []).filter((v) => v.status === "ACTIVE");

  if (!activeVouchers || activeVouchers.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-gray-100 flex items-center gap-4 shadow-sm">
        <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Ticket className="size-5 text-gray-300" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Voucher Saya</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Belum ada voucher tersedia
          </p>
        </div>
      </div>
    );
  }

  const previewVoucher = activeVouchers[0];

  return (
    <>
      <style>{STYLES}</style>

      {/* Card wrapper */}
      <div
        className="rounded-2xl overflow-hidden border border-white/80"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,240,238,0.6) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
        }}
      >
        {/* Top row */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #e3242b 0%, #c9181f 100%)",
              boxShadow: "0 4px 12px rgba(195,24,31,0.3)",
            }}
          >
            <Ticket className="size-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">Voucher Saya</h3>
              <span
                className="text-[10px] font-black text-white px-2 py-0.5 rounded-full leading-none"
                style={{
                  background:
                    "linear-gradient(135deg, #e3242b, #c9181f)",
                  boxShadow: "0 2px 6px rgba(195,24,31,0.35)",
                }}
              >
                {activeVouchers.length}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {activeVouchers.length} voucher aktif
            </p>
          </div>
          <Sparkles className="size-4 text-red-300" />
        </div>

        {/* Preview mini card */}
        <div className="px-4 pb-3">
          <div
            className="flex items-center justify-between rounded-xl px-3 py-2.5 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,218,214,0.3) 100%)",
              borderColor: "rgba(255,179,172,0.5)",
            }}
          >
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <Tag className="size-3 text-red-400" />
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                  {previewVoucher.type === "FIXED" ? "Potongan" : "Diskon"}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-800 truncate max-w-[150px] block">
                {previewVoucher.name}
              </span>
            </div>
            <div className="text-right">
              <span
                className="font-black text-sm"
                style={{
                  background:
                    "linear-gradient(90deg, #c9181f, #e3242b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {previewVoucher.type === "FIXED"
                  ? formatRupiah(previewVoucher.value)
                  : `${previewVoucher.value}%`}
              </span>
              <p className="text-[9px] text-red-400 font-bold uppercase tracking-wide">
                OFF
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                className="w-full h-10 flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs text-red-600 transition-all hover:bg-red-50 active:scale-[0.98]"
                style={{
                  border: "1.5px solid rgba(227,36,43,0.2)",
                  background: "rgba(255,255,255,0.5)",
                }}
              >
                Lihat Semua Voucher
                <ChevronRight className="size-3.5" />
              </button>
            </DialogTrigger>

            {/* Modal */}
            <DialogContent className="p-0 overflow-hidden rounded-[28px] border-none shadow-[0_32px_64px_rgba(0,0,0,0.2)] max-w-md w-full flex flex-col max-h-[88dvh] outline-none">
              <div className="uvs-liquid-bg flex flex-col flex-1 min-h-0">

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
                    <div
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                      }}
                    />
                    <div className="w-10" />
                    <DialogTitle className="font-extrabold text-[17px] tracking-tight text-white drop-shadow-sm">
                      Voucher Aktif
                    </DialogTitle>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-90"
                    >
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                </DialogHeader>

                {/* Count strip */}
                <div className="px-5 pt-4 pb-1 relative z-10">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {activeVouchers.length} voucher aktif
                  </p>
                </div>

                {/* List */}
                <ScrollArea className="flex-1 min-h-0 px-5 pb-2 relative z-10">
                  <div className="space-y-3 pb-2">
                    {activeVouchers.map((v, i) => (
                      <div
                        key={v.id}
                        className="uvs-card rounded-2xl flex overflow-hidden relative"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        {/* Details */}
                        <div className="flex-1 p-4 flex flex-col justify-center gap-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Tag className="size-3 text-red-400 flex-shrink-0" />
                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">
                              {v.type === "FIXED" ? "Potongan" : "Diskon"}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                            {v.name}
                          </h4>
                          {v.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                              {v.description}
                            </p>
                          )}
                        </div>

                        {/* Perforation */}
                        <div className="relative flex items-center justify-center w-5 flex-shrink-0">
                          <div className="uvs-dashed" />
                        </div>

                        {/* Notches — card-level, clipped by overflow-hidden */}
                        <span className="uvs-notch uvs-notch-t" />
                        <span className="uvs-notch uvs-notch-b" />

                        {/* Value */}
                        <div className="uvs-value-pane w-[88px] flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-r-2xl gap-0.5">
                          <span
                            className="uvs-shimmer font-black leading-none"
                            style={{
                              fontSize: valueFontSize(v),
                              letterSpacing: "-0.03em",
                            }}
                          >
                            {formatValue(v)}
                          </span>
                          {v.type === "FIXED" && (
                            <span className="text-[8px] font-black text-red-700 tracking-tighter leading-none">
                              RIBU
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider mt-0.5">
                            OFF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div
                  className="px-5 py-4 flex-shrink-0 relative z-20"
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
                    className="w-full py-3.5 rounded-2xl font-extrabold text-[15px] text-white tracking-tight transition-all hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(90deg, #e3242b 0%, #c9181f 50%, #e3242b 100%)",
                      backgroundSize: "200% auto",
                      boxShadow: "0 4px 16px rgba(195,24,31,0.3)",
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
