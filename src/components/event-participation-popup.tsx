"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Timer, Users } from "lucide-react";
import {
  getActiveEventSlot,
  processEventParticipation,
} from "@/features/user/lib/event-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EventParticipationPopup() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [slotInfo, setSlotInfo] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Triggered only on canteen detail page
  const isCanteenDetail =
    pathname.startsWith("/kantin/") && pathname.split("/").length === 3;

  useEffect(() => {
    if (
      !isCanteenDetail ||
      status === "loading" ||
      hasDismissed ||
      (session && session.user.name === "Tamu")
    )
      return;

    const checkEvent = async () => {
      const res = await getActiveEventSlot(session?.user?.id);
      if (res.success && res.data) {
        if (!res.data.hasParticipated) {
          setSlotInfo(res.data.slot);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    };

    checkEvent();
  }, [pathname, session, status, isCanteenDetail, hasDismissed]);

  // Countdown timer
  useEffect(() => {
    if (!slotInfo || !isOpen) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(slotInfo.end_time).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("EXPIRED");
        setIsOpen(false);
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [slotInfo, isOpen]);

  const handleJoin = () => {
    // Check if not logged in or still a guest (username is empty for guests)
    if (!session || !session.user?.username) {
      router.push("/login-pelanggan");
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      await processEventParticipation(session.user.id);
      setIsOpen(false);
      setHasDismissed(true);
    });
  };

  if (!slotInfo) return null;

  const remainingSlots = slotInfo.quota - slotInfo.current_usage;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setHasDismissed(true);
      }}
    >
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-transparent shadow-none">
        <div className="relative p-6 bg-white rounded-3xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-50 rounded-full blur-3xl opacity-60" />

          <div className="relative flex flex-col items-center text-center">
            <div className="size-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Gift className="size-10 text-primary" />
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl text-center font-black leading-tight">
                Wah, Kamu Dapat Kuota Terbatas!
              </DialogTitle>
              <DialogDescription className=" text-center font-medium">
                Khusus buat kamu yang baru gabung, ada voucher potongan harga
                nih. Yuk, klaim dan langsung pakai buat jajan!
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 w-full grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex flex-col items-center justify-center">
                <Users className="size-6 text-orange-600 mb-2" />
                <p className="text-[10px] uppercase font-bold text-orange-400">
                  Sisa Kuota
                </p>
                <p className="text-xl font-black text-orange-700">
                  {remainingSlots}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center">
                <Timer className="size-6 text-blue-600 mb-2" />
                <p className="text-[10px] uppercase font-bold text-blue-400">
                  Berakhir Dalam
                </p>
                <p className="text-xl font-black text-blue-700">{timeLeft}</p>
              </div>
            </div>

            <div className="mt-8 w-full p-5 bg-linear-to-br from-primary to-primary/50 rounded-2xl text-white shadow-lg relative overflow-hidden group">
              <div className="relative z-10 text-left">
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                  Edisi Terbatas
                </p>
                <h4 className="text-2xl font-black">Diskon 40%</h4>
                <p className="text-sm font-medium mt-1 text-orange-100">
                  Hemat hingga Rp24000
                </p>
              </div>
            </div>

            <div className="mt-8 w-full flex flex-col gap-3">
              <Button
                onClick={handleJoin}
                disabled={remainingSlots <= 0}
                className="h-11"
              >
                {remainingSlots > 0
                  ? "Mendaftar dan Dapatkan Diskon"
                  : "Kuota Habis"}
              </Button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground text-sm transition-colors"
              >
                Gunakan mode tamu
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
