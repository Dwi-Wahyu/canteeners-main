import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export default async function KebijakanRefundPage({
  searchParams,
}: {
  searchParams: Promise<{ back_url?: string }>;
}) {
  const { back_url } = await searchParams;

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton
        title="Kebijakan Refund"
        backUrl={back_url || "/"}
      />

      <div className="max-w-4xl mx-auto px-5 pt-24 space-y-8 text-gray-800 leading-relaxed text-justify">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl uppercase mb-2">
            KEBIJAKAN PENGEMBALIAN DANA (REFUND POLICY)
          </h1>
          <h2 className="text-2xl font-semibold text-primary">Kantiners</h2>
          <p className="text-sm text-muted-foreground">
            Versi 1.2 | Berlaku mulai: [Tanggal Berlaku]
          </p>
          <div className="mt-6 text-muted-foreground space-y-4">
            <p>
              Kebijakan Pengembalian Dana (<em>Refund Policy</em>) ini merupakan
              bagian yang tidak terpisahkan dari Syarat dan Ketentuan Pengguna
              Kantiners. Dokumen ini mengatur hak pengguna serta prosedur
              terkait pembatalan pesanan dan pengembalian dana di dalam platform
              Kantiners.
            </p>
          </div>
        </header>

        {/* 1. Kondisi yang Memenuhi Syarat Refund */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            1. Kondisi yang Memenuhi Syarat Refund
          </h3>
          <p className="mb-3">
            Pengguna berhak mengajukan permohonan pengembalian dana (
            <em>refund</em>), baik secara penuh (<strong>Full Refund</strong>)
            maupun sebagian (<strong>Partial Refund</strong>), apabila memenuhi
            salah satu kondisi berikut:
          </p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Stok Habis / Pesanan Dibatalkan Mitra:</strong> Pihak
              Mitra Kedai membatalkan pesanan setelah Pengguna berhasil
              melakukan pembayaran. (
              <em>
                Catatan: Jika Pengguna memesan beberapa menu dan hanya 1 menu
                yang habis, maka yang di-refund hanya seharga menu yang habis
                tersebut / Partial Refund
              </em>
              ).
            </li>
            <li>
              <strong>Keterlambatan Ekstrem:</strong> Mitra Kedai terlambat
              mengantarkan pesanan yang melebihi batas estimasi waktu wajar yang
              tertera atau disepakati pada Platform.
            </li>
            <li>
              <strong>Pesanan Tidak Sesuai:</strong> Mitra Kedai menyajikan dan
              mengantarkan menu yang berbeda dengan rincian pesanan yang dibeli
              Pengguna di aplikasi.
            </li>
            <li>
              <strong>Kondisi Produk Rusak:</strong> Pesanan yang diterima
              Pengguna dalam kondisi rusak, tidak layak konsumsi, atau tumpah
              akibat kelalaian dari pihak Mitra Kedai.
            </li>
          </ol>
        </section>

        {/* 2. Syarat & Bukti Pengajuan */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            2. Syarat &amp; Bukti Pengajuan
          </h3>
          <p className="mb-3">
            Untuk memproses <em>refund</em>, Pengguna wajib memenuhi persyaratan
            berikut:
          </p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Batas Waktu Komplain:</strong> Permohonan harus diajukan
              maksimal <strong>1 (satu) jam</strong> setelah pesanan diterima
              oleh Pengguna atau sejak status pesanan selesai. Lewat dari batas
              waktu ini, permohonan tidak dapat diproses.
            </li>
            <li>
              <strong>Bukti Visual:</strong> Khusus untuk pesanan yang tidak
              sesuai atau rusak (Poin 1.3 dan 1.4), Pengguna wajib menyertakan
              bukti foto pesanan yang diterima secara jelas.
            </li>
          </ul>
        </section>

        {/* 3. Kondisi yang Tidak Memenuhi Syarat Refund */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            3. Kondisi yang Tidak Memenuhi Syarat Refund
          </h3>
          <p className="mb-3">
            Pengguna tidak berhak mendapatkan pengembalian dana apabila:
          </p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              Pengguna salah melakukan pemesanan (salah pilih menu, salah pilih
              varian, atau salah memasukkan nomor meja) dan pesanan sudah
              diproses oleh Mitra Kedai.
            </li>
            <li>
              Pengguna berubah pikiran setelah pesanan dibayar dan mulai
              diproses oleh Mitra Kedai.
            </li>
            <li>
              Pengguna tidak berada di meja yang diinputkan saat pesanan
              diantarkan, dan tidak mengambil pesanannya langsung ke Kedai dalam
              batas waktu yang wajar.
            </li>
          </ol>
        </section>

        {/* 4. Mekanisme & Batas Waktu Refund */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            4. Mekanisme &amp; Batas Waktu Refund
          </h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Pengajuan:</strong> Pengguna mengajukan permohonan{" "}
              <em>refund</em> melalui fitur yang tersedia pada platform atau
              langsung kepada Mitra Kedai dalam batas waktu maksimal 1 jam.
            </li>
            <li>
              <strong>Proses Pengembalian:</strong> Apabila permohonan memenuhi
              syarat, pihak Mitra Kedai berkewajiban penuh untuk mengembalikan
              dana secara langsung kepada Pengguna (baik melalui transfer
              rekening, <em>e-wallet</em>, maupun pengembalian tunai).
            </li>
            <li>
              <strong>Batas Waktu (SLA):</strong> Proses transfer atau
              pengembalian dana oleh Mitra Kedai harus diselesaikan
              selambat-lambatnya{" "}
              <strong>2x24 (satu kali dua puluh empat) jam</strong> sejak
              permohonan disetujui.
            </li>
          </ol>
        </section>

        {/* 5. Mediasi & Peran Kantiners (Customer Service) */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            5. Mediasi &amp; Peran Kantiners (Customer Service)
          </h3>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              Kantiners bertindak sebagai <strong>mediator</strong> antara
              Pengguna dan Mitra Kedai dalam hal penyelesaian sengketa
              transaksi.
            </li>
            <li>
              Apabila Pengguna belum menerima pengembalian dana melewati batas
              waktu 1x24 jam, atau permohonan ditolak oleh Mitra Kedai tanpa
              alasan yang sah, Pengguna berhak melakukan eskalasi kepada Layanan
              Pelanggan (<em>Customer Service</em>) Kantiners.
            </li>
            <li>
              Mengingat pembayaran ditransfer langsung ke Mitra Kedai, Pengguna
              memahami bahwa Kantiners <strong>tidak berkewajiban</strong> untuk
              menanggung atau mengganti dana tersebut dari kas perusahaan
              Kantiners apabila pihak Kedai gagal melakukan <em>refund</em>.
            </li>
            <li>
              Kantiners berhak memberikan sanksi tegas, mulai dari peringatan
              hingga pemutusan kemitraan, kepada Mitra Kedai yang terbukti
              menolak kewajiban <em>refund</em> yang sah.
            </li>
          </ol>
        </section>

        {/* Butuh Bantuan? */}
        <section className="mb-8 bg-gray-50 p-5 rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold mb-3 text-foreground">
            Butuh Bantuan?
          </h3>
          <p className="text-sm mb-3">
            Jika Anda memiliki pertanyaan lebih lanjut terkait status
            pengembalian dana Anda, silakan hubungi Layanan Pelanggan (CS)
            Kantiners melalui:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>WhatsApp Bisnis:</strong> [Masukkan Nomor WA]
            </li>
            <li>
              <strong>Email:</strong> [Masukkan Email Support/Admin]
            </li>
          </ul>
          <p className="text-xs text-muted-foreground italic mt-3">
            (Jam Operasional: Hari Kerja, Pukul 08.00–17.00 WIB)
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-center space-y-1 text-muted-foreground">
          <p className="font-semibold tracking-tight uppercase text-[10px]">
            Kantiners • Layanan Customer Service: [Nomor WhatsApp Bisnis]
          </p>
          <p className="italic text-xs">
            Dokumen ini berlaku sejak [Tanggal Berlaku] • Versi 1.2
          </p>
        </footer>
      </div>
    </div>
  );
}
