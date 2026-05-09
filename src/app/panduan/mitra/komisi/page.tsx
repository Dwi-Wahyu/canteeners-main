"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Info } from "lucide-react";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default function PanduanKomisiMitraPage() {
  return (
    <Suspense>
      <PanduanKomisiMitraContent />
    </Suspense>
  );
}

function PanduanKomisiMitraContent() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/panduan/mitra";

  const sections = [
    {
      title: "1. Perhitungan Komisi Dasar",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Platform mengenakan biaya layanan (komisi) untuk setiap item yang
            terjual dengan skema sebagai berikut:
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <ul className="space-y-2">
              <li className="flex justify-between text-sm">
                <span>Biaya per Item (Qty)</span>
                <span className="font-bold">Rp1.000</span>
              </li>
              <Separator />
              <li className="flex flex-col gap-1">
                <span className="text-sm font-bold text-primary">
                  Diskon Volume:
                </span>
                <p className="text-xs text-muted-foreground">
                  Jika total kuantitas dalam satu pesanan{" "}
                  <strong>lebih dari 2 item</strong>, maka total komisi akan
                  diberikan <strong>potongan sebesar 50%</strong>.
                </p>
              </li>
            </ul>
          </div>
          <div className="text-xs text-muted-foreground italic bg-muted p-2 rounded">
            Contoh: <br />
            - 2 Item: 2 x Rp1.000 = Rp2.000 <br />- 4 Item: (4 x Rp1.000) x 50%
            = Rp2.000 (Sama dengan 2 item!)
          </div>
        </div>
      ),
    },
    {
      title: "2. Penyesuaian Refund",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kami menjunjung tinggi keadilan. Jika terjadi pengembalian dana
            (refund) yang disetujui, komisi akan disesuaikan:
          </p>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <Info className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-800">
              Komisi akan <strong>dikurangi secara otomatis</strong> sesuai
              dengan jumlah kuantitas item yang berhasil di-refund dalam periode
              billing tersebut.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "3. Subsidi Voucher Platform",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Platform seringkali mengadakan promo atau voucher untuk meningkatkan
            penjualan Anda.
          </p>
          <ul className="space-y-2">
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Subsidi Penuh:</strong> Jika voucher diinisiasi oleh
                Platform (bukan dari kedai), maka nilai diskon tersebut akan
                menjadi <strong>pengurang tagihan komisi</strong> Anda.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Net Billing:</strong> Total tagihan akhir dihitung dari:{" "}
                <br />
                <code className="text-[10px] bg-muted p-1 rounded font-bold">
                  (Total Komisi) - (Total Subsidi Platform) - (Penyesuaian
                  Refund)
                </code>
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "4. Cara Mengecek Tagihan",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Anda dapat memantau tagihan mingguan melalui Dashboard Kedai:
          </p>
          <ol className="space-y-3">
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">1.</span>
              <span>
                Buka menu <strong>Tagihan</strong> pada Dashboard Kedai.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">2.</span>
              <span>
                Pilih salah satu periode billing untuk melihat{" "}
                <strong>Detail Tagihan</strong>.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">3.</span>
              <span>
                Di dalam detail, Anda akan melihat rincian setiap pesanan,
                komisi yang dikenakan, serta subsidi yang didapatkan.
              </span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "5. Siklus & Konsekuensi Penunggakan",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Proses penagihan (billing) dilakukan setiap{" "}
            <strong>satu minggu sekali</strong>.
          </p>
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
            <AlertCircle className="text-red-600 shrink-0" size={20} />
            <div className="space-y-1">
              <h5 className="font-bold text-red-900 text-sm">
                Penangguhan Layanan
              </h5>
              <p className="text-xs text-red-800 leading-relaxed">
                Jika kedai masih memiliki tagihan yang menunggak melewati batas
                waktu, maka{" "}
                <strong>status kedai akan ditangguhkan sementara</strong> dan
                dibatasi untuk menggunakan layanan platform hingga tagihan
                diselesaikan.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton title="Detail Komisi Platform" backUrl={backUrl} />

      <main className="max-w-4xl mx-auto px-5 pt-24 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            Mitra Kantiners
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Sistem Komisi
          </h2>
          <p className="text-muted-foreground text-lg">
            Pelajari bagaimana sistem menghitung komisi, subsidi, dan
            penyesuaian untuk menjaga keberlangsungan layanan.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <h3 className="font-bold text-lg leading-tight pt-1 flex items-center gap-3">
                      {section.title}
                    </h3>
                    {section.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Guide */}
        <section className="bg-orange-50 p-6 rounded-xl border border-orange-200 space-y-4">
          <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2">
            Penyelesaian Tagihan
          </h3>
          <p className="text-sm text-orange-800 leading-relaxed">
            Tagihan yang berstatus <strong>Belum Dibayar</strong> wajib
            diselesaikan segera melalui transfer ke rekening pengelola kantin
            yang tertera pada detail tagihan. Penyelesaian yang tepat waktu
            sangat penting untuk menghindari penangguhan akun kedai Anda.
          </p>
        </section>
      </main>
    </div>
  );
}
