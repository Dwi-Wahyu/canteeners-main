"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Gift,
  TicketPercent,
  X,
  AlertCircle as AlertIcon,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateReferralCode } from "@/features/user/lib/user-actions";

interface ReferralSectionProps {
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode: string | null;
}

export default function ReferralSection({
  onApply,
  onRemove,
  appliedCode,
}: ReferralSectionProps) {
  const [referralInput, setReferralInput] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [shouldShake, setShouldShake] = useState(false);

  const handleApplyReferral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!referralInput.trim() || isValidatingCode) return;

    setReferralError(null);
    setShouldShake(false);
    setIsValidatingCode(true);

    try {
      const res = await validateReferralCode(
        referralInput.trim().toUpperCase(),
      );

      if (res.success) {
        if (res.data) {
          onApply(res.data.code, res.data.discount);
        }
        setIsDialogOpen(false);
        setReferralInput("");
      } else {
        setReferralError(res.error.message);
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
      }
    } catch (error) {
      setReferralError("Terjadi kesalahan sistem");
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setReferralInput("");
    setReferralError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">Promo & Referral</h1>
      {appliedCode ? (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl text-white">
              <TicketPercent size={18} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                Referral Digunakan
              </p>
              <p className="text-sm font-bold text-gray-900">{appliedCode}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
            onClick={handleRemove}
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full py-6 border-dashed border-2 hover:bg-gray-50 flex justify-between px-4 rounded-2xl group transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <TicketPercent
                  className=" group-hover:scale-110 transition-transform"
                  size={20}
                />
                <span className="text-sm font-semibold">
                  Punya Kode Referral?
                </span>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle>Masukkan Kode Referral</DialogTitle>
              <DialogDescription>
                Gunakan kode referral temanmu untuk membantu mereka mendapatkan
                cashback sebesar Rp 10.000.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleApplyReferral}
              className="flex flex-col gap-4 py-4"
            >
              <div className={shouldShake ? "animate-light-shake" : ""}>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Contoh: USER-X7Y2Z1"
                    className={`h-12 rounded-xl pl-4 pr-4 uppercase font-mono font-bold tracking-widest border-2 transition-all ${
                      referralError
                        ? "border-destructive focus-visible:ring-destructive bg-red-50/50"
                        : "border-primary/20 text-primary focus-visible:ring-primary"
                    }`}
                    value={referralInput}
                    onChange={(e) => {
                      setReferralInput(e.target.value);
                      if (referralError) setReferralError(null);
                    }}
                    autoFocus
                  />
                  {referralError && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1 ml-1 font-semibold animate-in fade-in slide-in-from-top-1">
                      <AlertIcon size={14} />
                      {referralError}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                className="h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold text-white shadow-lg shadow-primary/20"
                disabled={isValidatingCode || !referralInput.trim()}
              >
                {isValidatingCode ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Gunakan Kode"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
