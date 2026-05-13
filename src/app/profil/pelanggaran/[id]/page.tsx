import { auth } from "@/config/auth";
import { getCustomerViolationDetail } from "@/features/user/lib/user-queries";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ExternalLink,
  FileText,
  Gavel,
  History,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  customerViolationTitleMapping,
  customerViolationDescriptionMapping,
} from "@/constant/customer-violation-mapping";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Button } from "@/components/ui/button";

export default async function ViolationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session || !session.user.id) {
    redirect("/login-pelanggan");
  }

  const violation = await getCustomerViolationDetail(parseInt(id));

  if (!violation) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <TopbarWithBackButton
        title="Detail Pelanggaran"
        backUrl="/profil/pelanggaran"
      />

      <div className="max-w-md mx-auto px-5 pt-24 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 py-4">
          <div className="size-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-sm border-4 border-white">
            <ShieldAlert className="size-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">
              {customerViolationTitleMapping[violation.type] || violation.type}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              ID Pelanggaran: #{violation.id}
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent>
            <div className="bg-white space-y-4">
              <div className="flex items-start gap-4">
                <Calendar className="size-5 text-muted-foreground mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Waktu Kejadian
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {format(
                      new Date(violation.timestamp),
                      "EEEE, d MMMM yyyy",
                      { locale: idLocale },
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pukul {format(new Date(violation.timestamp), "HH:mm")} WIB
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FileText className="size-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Keterangan
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {customerViolationDescriptionMapping[violation.type] ||
                      "Pelanggaran aturan penggunaan layanan."}
                  </p>
                </div>
              </div>
            </div>

            {violation.order_id && (
              <div className="flex pt-4 mt-4 items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-white rounded-lg flex items-center justify-center shadow-xs text-blue-600 border">
                    <History className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Terkait Pesanan
                    </p>
                    <p className="text-xs font-bold text-gray-700">
                      #{violation.order_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-1.5 font-bold text-xs h-9"
                >
                  <Link href={`/order/${violation.order_id}`}>
                    Lihat Pesanan <ExternalLink className="size-3" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
              <div className="size-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                <ShieldAlert className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  Peringatan Keras
                </h3>
                <p className="text-xs text-amber-700 leading-relaxed mt-1">
                  Akun Anda tercatat melakukan aktivitas yang merugikan mitra
                  kedai. Jika pelanggaran yang sama terulang kembali dalam waktu
                  dekat, akun akan dibekukan sementara secara otomatis.
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full h-14 rounded-2xl border-gray-200 text-gray-700 font-bold gap-2"
            >
              <Link href="/syarat-dan-ketentuan/pelanggan">
                Pelajari Aturan Layanan <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
