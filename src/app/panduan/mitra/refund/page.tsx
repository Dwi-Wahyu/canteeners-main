"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, Lightbulb } from "lucide-react";
import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PanduanRefundMitraPage() {
  const searchParams = useSearchParams();
  const backUrl = searchParams.get("back_url") || "/panduan/mitra";

  const steps = [
    {
      title: "1. Menerima Notifikasi Pengajuan Refund",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Saat ada pelanggan yang merasa pesanannya bermasalah dan mengajukan{" "}
            <em>refund</em>, sistem akan memberi tahu Anda melalui dua cara:
          </p>
          <ul className="space-y-2">
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Notifikasi Langsung:</strong> Muncul pemberitahuan
                dengan judul "Permintaan Refund Baru" yang berisi detail singkat
                nominal dan nomor pesanan.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Indikator di Dashboard:</strong> Pada halaman utama
                Dashboard Kedai, kotak menu <strong>Pengajuan Refund</strong>{" "}
                akan menampilkan lencana merah berisi angka yang menunjukkan
                jumlah pengajuan baru yang belum Anda proses (<em>Pending</em>).
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "2. Memeriksa Daftar dan Detail Refund",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Langkah selanjutnya adalah memeriksa bukti yang diajukan oleh
            pelanggan:
          </p>
          <ol className="space-y-3">
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">1.</span>
              <span>
                Klik menu <strong>Pengajuan Refund</strong> di Dashboard Kedai.
                Anda akan melihat daftar semua permintaan yang masuk beserta
                statusnya (Menunggu, Ditinjau, Selesai, Ditolak).
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">2.</span>
              <span>
                Pilih pengajuan yang berstatus{" "}
                <strong>
                  Menunggu (<em>Pending</em>)
                </strong>
                . Sistem akan membawa Anda ke halaman{" "}
                <strong>Detail Refund</strong>.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="font-bold text-primary">3.</span>
              <span>
                Di halaman ini, perhatikan baik-baik: Alasan Refund, Nominal,
                dan Bukti Pendukung (Foto makanan atau <em>screenshot chat</em>
                ).
              </span>
            </li>
          </ol>
        </div>
      ),
    },
    {
      title: "3. Mengambil Keputusan (Setuju atau Tolak)",
      content: (
        <div className="space-y-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <h5 className="font-bold text-green-800 text-sm flex items-center gap-2 mb-1">
              <CheckCircle size={16} />
              Skenario A: Menyetujui Refund
            </h5>
            <p className="text-xs text-green-700 leading-relaxed">
              Jika kesalahan berasal dari kedai, Anda wajib menyetujuinya.
              Status pengajuan akan berubah menjadi{" "}
              <strong>
                Disetujui (<em>Approved</em>)
              </strong>
              . Namun, proses ini belum selesai sampai Anda mengirimkan dana.
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <h5 className="font-bold text-red-800 text-sm flex items-center gap-2 mb-1">
              <XCircle size={16} />
              Skenario B: Menolak Refund
            </h5>
            <p className="text-xs text-red-700 leading-relaxed">
              Jika klaim tidak valid, tekan tombol{" "}
              <strong>
                Tolak (<em>Reject</em>)
              </strong>{" "}
              dan <strong>wajib</strong> ketikkan alasan penolakan secara jelas.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "4. Proses Pengembalian Dana (Disbursement)",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Setelah pengajuan disetujui, Anda harus segera mengembalikan dana
            kepada pelanggan sesuai nominal dan metode yang dipilih:
          </p>
          <ul className="space-y-2">
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Metode Transfer:</strong> Jika pelanggan memilih
                transfer, Anda <strong>wajib mengunggah bukti transfer</strong>{" "}
                yang valid sebagai syarat untuk memproses refund.
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>Konfirmasi Pelanggan:</strong> Setelah dana dikirim dan
                status berubah menjadi <strong>Diproses (Processed)</strong>,
                pelanggan mempunyai hak untuk mengonfirmasi bahwa dana sudah
                diterima sebelum refund dianggap selesai sepenuhnya.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "5. Batas Waktu dan Proses Eskalasi",
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <Clock className="text-orange-600 shrink-0" size={20} />
            <div className="space-y-1">
              <h5 className="font-bold text-orange-900 text-sm">
                Batas Waktu 1x24 Jam
              </h5>
              <p className="text-xs text-orange-800">
                Anda memiliki waktu maksimal 1x24 jam untuk memberikan keputusan
                sejak pelanggan mengajukan refund.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Jika lebih dari 1x24 jam atau pelanggan merasa penolakan tidak adil,
            mereka dapat melakukan <strong>Eskalasi ke CS Kantiners</strong>.
            Keputusan Admin setelah eskalasi bersifat <strong>mutlak</strong>.
          </p>
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
            Mitra Kantiners
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Alur Pengembalian Dana
          </h2>
          <p className="text-muted-foreground text-lg">
            Panduan lengkap mengenai cara mengelola dan merespons pengajuan
            refund dari pelanggan.
          </p>
        </div>

        {/* Introduction */}
        <section className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fitur Refund melindungi hak pelanggan jika terjadi kesalahan fatal
              (makanan rusak, tertukar, atau stok habis). Sebagai pemilik kedai,
              tinjau setiap pengajuan dengan adil dan profesional.
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
                    <h3 className="font-bold text-lg leading-tight pt-1">
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
            <Lightbulb className="text-yellow-500" />
            Tips Menghindari Refund
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Update Menu",
                desc: "Selalu update ketersediaan menu jika bahan baku menipis.",
              },
              {
                title: "Cek Ulang",
                desc: "Pastikan pesanan sesuai dengan struk sebelum diserahkan.",
              },
              {
                title: "Gunakan Chat",
                desc: "Komunikasikan bahan pengganti via chat sebelum memproses.",
              },
            ].map((tip, i) => (
              <div
                key={i}
                className="p-4 bg-card border rounded-xl shadow-sm space-y-2"
              >
                <h5 className="font-bold text-sm text-primary">{tip.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
