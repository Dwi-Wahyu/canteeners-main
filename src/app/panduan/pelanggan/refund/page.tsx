"use client";

import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Info,
  Lightbulb,
  FileText,
  Camera,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PanduanRefundPelangganPage() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/panduan/pelanggan";

  const steps = [
    {
      title: "1. Syarat Pengajuan Refund",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Anda berhak mengajukan pengembalian dana apabila pesanan memenuhi
            salah satu kondisi berikut:
          </p>
          <ul className="space-y-2">
            {[
              "Pesanan sangat terlambat dari waktu estimasi.",
              "Menu makanan atau minuman yang diterima salah/tertukar.",
              "Terdapat pesanan yang kurang (item tidak lengkap).",
              "Makanan atau minuman diterima dalam kondisi rusak/tidak layak.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "2. Cara Mengajukan Refund",
      content: (
        <div className="space-y-3">
          <ol className="space-y-3">
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">1.</span>
              <span>
                Buka halaman <strong>Detail Pesanan</strong> dari transaksi yang
                bermasalah.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">2.</span>
              <span>
                Tekan tombol <strong>Ajukan Refund</strong>.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">3.</span>
              <span>
                Pilih <strong>Alasan Refund</strong> yang paling sesuai.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">4.</span>
              <span className="flex flex-col gap-1">
                <strong>Wajib Lampirkan Bukti:</strong>
                <span>
                  Unggah foto makanan yang salah/rusak atau{" "}
                  <em>screenshot chat</em> dengan penjual.
                </span>
              </span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "3. Proses dan Konfirmasi",
      content: (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-2">
            <h5 className="font-bold text-blue-800 text-sm flex items-center gap-2 mb-1">
              <Clock size={16} />
              Batas Waktu Kedai
            </h5>
            <p className="text-xs text-blue-700 leading-relaxed">
              Pemilik kedai memiliki waktu maksimal <strong>1x24 jam</strong>{" "}
              untuk merespons pengajuan Anda.
            </p>
          </div>
          <ul className="space-y-2">
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Penyaluran Dana:</strong> Jika disetujui, dana akan
                dikirim via e-wallet atau tunai. Kedai akan mengunggah bukti
                transfer.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Konfirmasi Pelanggan:</strong> Anda{" "}
                <strong>wajib</strong> menekan tombol{" "}
                <strong>Konfirmasi</strong> setelah dana diterima agar status
                menjadi Selesai.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "4. Fitur Eskalasi (Bantuan CS)",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gunakan fitur ini apabila:
          </p>
          <ul className="space-y-2">
            {[
              "Kedai tidak merespons > 1x24 jam.",
              "Refund ditolak tanpa alasan masuk akal.",
              "Kedai mengunggah bukti transfer palsu.",
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-xs text-orange-800 italic">
              Tekan <strong>Eskalasi ke Admin</strong> di detail refund. Tim
              kami akan bertindak sebagai mediator.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton title="Panduan Refund" backUrl={backUrl} />

      <main className="max-w-4xl mx-auto px-5 pt-24 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary" className="px-3 py-1">
            Pelanggan Kantiners
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Panduan Pengembalian Dana
          </h2>
          <p className="text-muted-foreground text-lg">
            Kami memastikan dana Anda aman jika terjadi kendala pada pesanan.
            Pelajari prosedur refund berikut.
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kepuasan Anda adalah prioritas kami. Jika Anda mengalami kendala
              fatal pada pesanan yang sudah dibayar, gunakan fitur Refund untuk
              melindungi hak Anda.
            </p>
          </div>
        </section>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <h3 className="font-bold text-lg leading-tight pt-1 flex items-center gap-2">
                      {step.title}
                    </h3>
                    {step.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Tips Penting
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Simpan Bukti",
                desc: "Selalu foto makanan atau simpan screenshot chat sebagai bukti kuat pengajuan.",
                icon: <Camera size={20} className="text-primary" />,
              },
              {
                title: "Gunakan Chat",
                desc: "Coba komunikasikan kendala ke kedai via fitur Chat sebelum mengajukan refund.",
                icon: <MessageCircle size={20} className="text-primary" />,
              },
            ].map((tip, i) => (
              <div
                key={i}
                className="p-4 bg-card border rounded-xl shadow-sm space-y-2 flex gap-3"
              >
                <div className="mt-1">{tip.icon}</div>
                <div>
                  <h5 className="font-bold text-sm text-primary">
                    {tip.title}
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
