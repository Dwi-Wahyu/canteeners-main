import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getMyShopViolations } from "@/features/shop/violations/lib/shop-violation-queries";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  shopViolationTitleMapping,
  shopViolationDescriptionMapping,
  shopViolationIconMapping,
} from "@/constant/shop-violation-mapping";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Gavel,
  ChevronRight,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ShopPelanggaranPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login-kedai");
  }

  // Ambil shop_id dari pemilik yang sedang login
  const owner = await prisma.owner.findUnique({
    where: { user_id: session.user.id },
    include: {
      shop: { select: { id: true, status: true, suspended_reason: true } },
    },
  });

  if (!owner?.shop) {
    redirect("/dashboard-kedai");
  }

  const violations = await getMyShopViolations(owner.shop.id);
  const isSuspended = owner.shop.status === "SUSPENDED";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TopbarWithBackButton
        title="Pelanggaran Kedai"
        backUrl="/dashboard-kedai"
      />

      <div className="max-w-md mx-auto pt-16 space-y-6">
        {/* Status suspend */}
        {isSuspended ? (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTitle className="text-red-800 font-bold">
              Kedai Dinonaktifkan
            </AlertTitle>
            <AlertDescription className="text-red-700 space-y-2 mt-2">
              <p>Kedai Anda saat ini dinonaktifkan oleh admin.</p>
              {owner.shop.suspended_reason && (
                <p className="text-xs italic">{owner.shop.suspended_reason}</p>
              )}
              <p className="text-xs">
                Hubungi admin untuk informasi lebih lanjut.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="size-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Status Kedai Baik</h3>
              <p className="text-xs text-green-700">
                Patuhi terus aturan untuk kenyamanan pelanggan.
              </p>
            </div>
          </div>
        )}

        {/* Daftar pelanggaran */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            Riwayat Pelanggaran
          </h2>

          {violations.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Gavel className="size-10 mb-2 opacity-20" />
                <p>Belum ada catatan pelanggaran.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {violations.map((v) => (
                <Card
                  key={v.id}
                  className="border-red-50 hover:shadow-md transition-all"
                >
                  <CardContent className="flex items-center gap-4">
                    <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                      {shopViolationIconMapping[v.type] ?? (
                        <AlertTriangle className="size-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900">
                        {shopViolationTitleMapping[v.type] ?? v.type}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {v.note ??
                          shopViolationDescriptionMapping[v.type] ??
                          ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                        {format(new Date(v.created_at), "d MMMM yyyy, HH:mm", {
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Info className="size-5" />
            <h3 className="font-bold text-sm">Informasi Penting</h3>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            Catatan pelanggaran dicatat oleh admin berdasarkan pantauan performa
            kedai. Pelanggaran berulang dapat berdampak pada status operasional
            kedai Anda. Pelajari aturan selengkapnya di Syarat & Ketentuan
            Mitra.
          </p>
          <Button
            asChild
            variant="link"
            className="text-blue-600 h-auto p-0 text-xs"
          >
            <Link href="/syarat-dan-ketentuan/mitra?back_url=/dashboard-kedai/pelanggaran">
              Baca Syarat & Ketentuan <ChevronRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
