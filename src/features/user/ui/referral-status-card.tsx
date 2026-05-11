"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Users, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralStatusCardProps {
  referralCode: string | null;
  usageCount: number;
  isEligible: boolean;
  onActivate: () => Promise<void>;
  isActivating: boolean;
}

export default function ReferralStatusCard({
  referralCode,
  usageCount,
  isEligible,
  onActivate,
  isActivating,
}: ReferralStatusCardProps) {
  const [copied, setCopied] = useState(false);
  const maxUsage = 3;
  const progress = (usageCount / maxUsage) * 100;

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    // toast.success("Kode referral berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!referralCode) {
    return (
      <Card className="overflow-hidden border-dashed border-2 border-primary/20 bg-primary/2">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
              <Gift size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Program Referral</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Aktifkan kode referral Anda dan dapatkan voucher diskon setiap
                ada 3 teman yang bergabung!
              </p>
              <Button
                size="sm"
                onClick={onActivate}
                disabled={!isEligible || isActivating}
                className="mt-2"
              >
                {isActivating ? (
                  <Loader2 className=" animate-spin" />
                ) : (
                  <Gift className="" />
                )}
                Aktifkan Kode
              </Button>
              {!isEligible && (
                <p className="text-[10px] text-amber-600 font-medium mt-2 flex items-center gap-1">
                  <Info size={12} />
                  Selesaikan minimal 2 pesanan untuk mengaktifkan
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 mt-6 border-none shadow-sm bg-white ring-1 ring-gray-100">
      <div className="bg-primary p-5 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              Kode Referral Saya
            </p>
            <h3 className="text-2xl font-black tracking-tighter mt-1">
              {referralCode}
            </h3>
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-xl size-10 bg-white/20 hover:bg-white/30 border-none text-white transition-all active:scale-95"
            onClick={handleCopy}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </Button>
        </div>

        <div className="flex items-center gap-2 bg-black/10 rounded-lg px-3 py-2">
          <Info size={14} className="shrink-0" />
          <p className="text-[10px] font-medium leading-tight">
            Bagikan kode ini ke temanmu. Dapatkan voucher spesial setiap 3 teman
            menggunakan kodemu!
          </p>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="p-5 pt-0">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">
                Progres Teman
              </span>
            </div>
            <span className="text-xs font-bold text-primary">
              {usageCount} / {maxUsage}
            </span>
          </div>

          <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <p className="text-[10px] text-muted-foreground font-medium">
              {usageCount === 0
                ? "Belum ada teman bergabung"
                : `${usageCount} teman telah bergabung`}
            </p>
            {usageCount === maxUsage && (
              <p className="text-[10px] text-green-600 font-bold animate-pulse">
                Siap klaim voucher!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
