"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeRefund } from "@/features/shop/refund/lib/refund-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ConfirmRefundPage({
  params,
}: {
  params: Promise<{ refund_id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    async function handleConfirm() {
      try {
        const { refund_id } = await params;
        const backUrl = searchParams.get("back_url") || "/order";

        const result = await completeRefund({ refund_id });

        if (result.success) {
          // toast.success("Refund berhasil dikonfirmasi");
          router.replace(backUrl);
        } else {
          toast.error(result.error.message || "Gagal mengonfirmasi refund");
        }
      } catch (error) {
        console.error("ConfirmRefundPage Error:", error);
        toast.error("Terjadi kesalahan");
        router.replace("/order");
      }
    }

    handleConfirm();
  }, [params, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <div className="text-center">
        <h1 className="text-lg font-bold">Mengonfirmasi Refund...</h1>
        <p className="text-sm text-muted-foreground">
          Mohon tunggu sebentar, kami sedang memproses permintaan Anda.
        </p>
      </div>
    </div>
  );
}
