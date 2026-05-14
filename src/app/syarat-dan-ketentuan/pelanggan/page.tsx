import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export default async function SyaratDanKetentuanPelanggan({
  searchParams,
}: {
  searchParams: Promise<{ back_url?: string }>;
}) {
  const { back_url } = await searchParams;

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton
        title="S&K Pengguna"
        backUrl={back_url || "/"}
      />

      <div className="max-w-4xl mx-auto px-5 pt-24 space-y-8 text-gray-800 leading-relaxed text-justify">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl uppercase mb-2">
            SYARAT & KETENTUAN PENGGUNA
          </h1>
          <h2 className="text-2xl font-semibold text-primary">Canteeners</h2>
          <p className="text-sm text-muted-foreground">Versi 1.0</p>
          <div className="mt-6 text-muted-foreground space-y-4">
            <p>
              Selamat datang di Canteeners. Dengan mendaftar dan menggunakan
              platform kami, Anda (&quot;Pengguna&quot;) dianggap telah membaca,
              memahami, dan menyetujui seluruh isi Syarat dan Ketentuan
              (&quot;S&K&quot;) ini. Harap baca dengan seksama sebelum
              menggunakan layanan.
            </p>
            <p className="italic">
              S&K ini merupakan perjanjian yang mengikat secara hukum antara
              Pengguna dan Pihak Canteeners berdasarkan hukum yang berlaku di
              Republik Indonesia.
            </p>
          </div>
        </header>

        {/* 0. Definisi */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            0. Definisi
          </h3>
          <p className="mb-3">
            Untuk menghindari ambiguitas, istilah-istilah berikut digunakan
            secara konsisten dalam S&K ini:
          </p>
          <ul className="list-disc pl-10 space-y-2">
            <li>
              <strong>&quot;Pengguna&quot;</strong> adalah individu yang
              mendaftar dan menggunakan layanan Canteeners.
            </li>
            <li>
              <strong>&quot;Kedai&quot;</strong> atau{" "}
              <strong>&quot;Mitra&quot;</strong> adalah pelaku usaha
              makanan/minuman yang bergabung dengan platform Canteeners sebagai
              mitra independen.
            </li>
            <li>
              <strong>&quot;Platform&quot;</strong> adalah aplikasi mobile
              dan/atau web Canteeners beserta seluruh fiturnya.
            </li>
            <li>
              <strong>&quot;CS&quot;</strong> adalah Customer Service resmi
              Canteeners yang dapat dihubungi melalui WhatsApp Bisnis resmi.
            </li>
            <li>
              <strong>&quot;Pesanan&quot;</strong> adalah permintaan pembelian
              produk yang dilakukan Pengguna melalui Platform.
            </li>
            <li>
              <strong>&quot;Hari Kerja&quot;</strong> adalah Senin s.d. Jumat,
              pukul 08.00-17.00 WIB, kecuali hari libur nasional.
            </li>
          </ul>
        </section>

        {/* 1. Akun Pengguna */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            1. Akun Pengguna
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold mb-2 text-blue-900">1.1 Pendaftaran</h4>
              <p className="text-sm">
                Layanan Canteeners terbuka bagi seluruh lapisan masyarakat.
                Pendaftaran akun dilakukan secara eksklusif menggunakan alamat
                email aktif. Pengguna bertanggung jawab penuh memastikan email
                tersebut berada di bawah kendali pribadi guna keperluan
                verifikasi dan keamanan.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">1.2 Tanggung Jawab Akun</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  Pengguna bertanggung jawab penuh atas semua aktivitas yang
                  terjadi di dalam akunnya.
                </li>
                <li>
                  Pengguna wajib menjaga kerahasiaan akses dan tidak
                  membagikannya kepada pihak lain.
                </li>
                <li>
                  Canteeners tidak bertanggung jawab atas kerugian akibat
                  penyalahgunaan akun oleh pihak yang tidak berwenang.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Proses Pemesanan & Pembayaran */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            2. Proses Pemesanan & Pembayaran
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">2.1 Mekanisme Pembayaran</h4>
              <p className="text-sm">
                Pembayaran pesanan dilakukan secara langsung ke rekening milik
                Kedai (Mitra). Canteeners tidak memproses atau menahan dana
                pembayaran.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold mb-2">2.2 Bukti Pembayaran</h4>
              <p className="text-sm">
                Pengguna wajib mengunggah bukti pembayaran yang sah dalam waktu
                maksimal <strong>15 menit</strong> setelah menekan tombol
                &quot;Pesan&quot;. Keterlambatan dapat mengakibatkan pembatalan
                otomatis oleh sistem.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">2.3 Pengantaran Pesanan</h4>
              <p className="text-sm">
                Kedai mengantarkan pesanan ke meja yang diinput sebanyak satu
                kali. Jika Pengguna tidak di lokasi, Pengguna wajib
                mengonfirmasi via chat atau mengambil pesanan langsung ke Kedai.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Sanksi Pembatalan oleh Pengguna */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            3. Sanksi Pembatalan oleh Pengguna
          </h3>
          <div className="space-y-3 text-sm">
            <p>
              Sanksi berlaku jika Pengguna menekan tombol &quot;Pesan&quot;
              namun tidak mengunggah bukti bayar hingga batas waktu habis.
            </p>
            <p>
              Pembatalan sebanyak <strong>3 kali</strong> dalam satu hari akan
              mengakibatkan akun dinonaktifkan sementara secara otomatis.
            </p>
            <p className="font-semibold italic">
              Akun akan aktif kembali pada hari berikutnya.
            </p>
          </div>
        </section>

        {/* 4. Pembatalan pesanan & Proses Refund */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            4. Pembatalan pesanan & Proses Refund
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-bold mb-2">4.1 Hak Refund Pengguna</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Kedai membatalkan pesanan (stok habis, dsb).</li>
                <li>Keterlambatan antar melebihi estimasi waktu.</li>
                <li>Pesanan tidak sesuai atau dalam kondisi rusak.</li>
                <li>
                  Pemilik kedai tidak konfirmasi bukti pembayaran dalam selang
                  waktu tertentu.
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">4.2 Mekanisme Refund</h4>
              <p className="text-sm">
                Pengajuan refund dilakukan via platform. Mitra Kedai wajib
                mengembalikan dana maksimal <strong>1x24 jam</strong>. Jika
                sengketa berlanjut, Pengguna dapat melakukan eskalasi ke CS
                Canteeners sebagai mediator.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Penanganan Gangguan Sistem & Sengketa */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            5. Penanganan Gangguan Sistem & Sengketa
          </h3>
          <p className="text-sm">
            Jika Platform mengalami gangguan (down), pemesanan manual diizinkan
            dengan menunjukkan bukti bayar sah. Layanan CS tetap aktif pada Hari
            Kerja untuk membantu mediasi sengketa pembayaran.
          </p>
        </section>

        {/* 6. Aturan Ulasan (Review) Pengguna */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            6. Aturan Ulasan (Review) Pengguna
          </h3>
          <div className="space-y-4">
            <p className="text-sm">
              Ulasan dilarang mengandung kata kasar, SARA, fitnah, atau spam.
              Pelanggaran diproses bertahap: Peringatan → Pencabutan fitur
              review → Pemblokiran akun.
            </p>
          </div>
        </section>

        {/* 7. Larangan Umum & Perlindungan Aset */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            7. Larangan Umum & Perlindungan Aset
          </h3>
          <p className="text-sm mb-4">
            Dilarang keras melakukan peretasan, reverse engineering, atau
            pemalsuan bukti pembayaran. Pelanggaran teknis berakibat pemblokiran
            permanen dan jalur hukum.
          </p>
        </section>

        {/* 8. Perlindungan Data Pribadi */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            8. Perlindungan Data Pribadi
          </h3>
          <p className="text-sm">
            Canteeners mengumpulkan email dan data transaksi untuk operasional.
            Kami berkomitmen menjaga keamanan data sesuai Kebijakan Privasi yang
            berlaku.
          </p>
        </section>

        {/* 9. Batasan Tanggung Jawab */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            9. Batasan Tanggung Jawab
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              Canteeners tidak bertanggung jawab atas kualitas/keamanan produk
              kedai.
            </li>
            <li>
              Canteeners tidak bertanggung jawab atas kerugian akibat force
              majeure.
            </li>
            <li>
              Canteeners berperan sebagai mediator, bukan penjamin dana
              transaksi.
            </li>
          </ul>
        </section>

        {/* 10. Yurisdiksi & Penyelesaian Sengketa */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            10. Yurisdiksi & Penyelesaian Sengketa
          </h3>
          <p className="text-sm">
            Tunduk pada hukum Republik Indonesia. Penyelesaian sengketa
            diutamakan melalui musyawarah mufakat (30 hari) sebelum ke
            Pengadilan Negeri.
          </p>
        </section>

        {/* 11. Ketentuan Penutup */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            11. Ketentuan Penutup
          </h3>
          <p className="text-sm">
            Canteeners berhak mengubah S&K ini dengan pemberitahuan 7 hari
            sebelumnya. Layanan dukungan tersedia via WhatsApp Bisnis pada Hari
            Kerja.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-center space-y-1 text-muted-foreground">
          <p className="font-semibold tracking-tight uppercase text-[10px]">
            Canteeners • Layanan Customer Service: [Nomor WhatsApp Bisnis]
          </p>
          <p className="italic text-xs">
            Dokumen ini berlaku sejak [Tanggal Berlaku] • Versi 1.1
          </p>
        </footer>
      </div>
    </div>
  );
}
