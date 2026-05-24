import { auth } from "@/config/auth";
import {
  getCustomerViolations,
  getCustomerSuspensionStatus,
} from "@/features/user/lib/user-queries";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ChevronRight, Info, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { customerViolationTitleMapping } from "@/constant/customer-violation-mapping";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function ViolationsPage() {
  const session = await auth();

  if (!session || !session.user.id) {
    redirect("/login-pelanggan");
  }

  if (session && session.user.role === "SHOP_OWNER") {
    redirect("/dashboard-kedai");
  }

  const [violations, suspension] = await Promise.all([
    getCustomerViolations(session.user.id),
    getCustomerSuspensionStatus(session.user.id),
  ]);

  const isSuspended =
    suspension?.suspend_until &&
    new Date(suspension.suspend_until) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TopbarWithBackButton title="Pelanggaran" backUrl="/profil" />

      <div className="max-w-md mx-auto px-5 pt-24 space-y-6">
        {/* Suspension Status */}
        {isSuspended && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTitle className="text-red-800 font-bold">
              Akun Dibekukan Sementara
            </AlertTitle>
            <AlertDescription className="text-red-700 space-y-2 mt-2">
              <p>
                Akun Anda sedang ditangguhkan karena melakukan pelanggaran
                berulang sesuai Syarat & Ketentuan.
              </p>
              <div className="flex items-start gap-2">
                <div>
                  <p className="text-xs font-bold">Aktif Kembali Pada</p>
                  <p className="text-sm font-medium">
                    {format(
                      new Date(suspension.suspend_until!),
                      "EEEE, d MMMM yyyy HH:mm",
                      { locale: idLocale },
                    )}
                  </p>
                </div>
              </div>
              {suspension.suspend_reason && (
                <div className="flex items-start gap-2">
                  <p className="text-xs italic">{suspension.suspend_reason}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              Riwayat Pelanggaran
            </h2>
          </div>

          {violations.length === 0 ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="size-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">Status Akun Baik</h3>
                <p className="text-xs text-green-700">
                  Belum ada catatan pelanggaran. Patuhi terus aturan demi
                  kenyamanan bersama.
                </p>
              </div>
            </div>
          ) : (
            <div className="gap-3 flex flex-col">
              {violations.map((v) => (
                <Link key={v.id} href={`/profil/pelanggaran/${v.id}`}>
                  <Card className="hover:shadow-md transition-all active:scale-[0.98] border-red-50">
                    <CardContent className="flex items-center gap-4">
                      <div className="size-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900">
                          {customerViolationTitleMapping[v.type] || v.type}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {format(new Date(v.timestamp), "d MMMM yyyy, HH:mm", {
                            locale: idLocale,
                          })}
                        </p>
                      </div>
                      <ChevronRight className="size-4 text-gray-300" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Info className="size-5" />
            <h3 className="font-bold text-sm">Informasi Penting</h3>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            Pembatalan pesanan yang sudah dibuat tanpa pembayaran yang sah dapat
            mengakibatkan sanksi pembekuan akun sementara jika dilakukan
            berulang kali. Pelajari aturan selengkapnya di Syarat & Ketentuan.
          </p>
          <Link
            className="text-xs text-blue-700 flex gap-2 items-center"
            href="/syarat-dan-ketentuan/pelanggan?back_url=/profil/pelanggaran"
          >
            Baca Syarat & Ketentuan <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
