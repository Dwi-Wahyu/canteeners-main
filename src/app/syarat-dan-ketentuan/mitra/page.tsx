import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export default async function SyaratDanKetentuanMitra({
  searchParams,
}: {
  searchParams: Promise<{ back_url?: string }>;
}) {
  const { back_url } = await searchParams;

  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton title="S&K Kemitraan" backUrl={back_url || "/"} />

      <div className="max-w-4xl mx-auto px-5 pt-24 space-y-8 text-gray-800 leading-relaxed text-justify">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl uppercase mb-2">
            SYARAT & KETENTUAN KEMITRAAN
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">
            Kantiners – Pemilik Kedai (Mitra)
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Versi 1.1 | Berlaku mulai: [Tanggal Berlaku]
          </p>
          <div className="mt-6 text-gray-600 text-sm italic space-y-4">
            <p>
              Dokumen ini merupakan Perjanjian Kemitraan yang mengikat secara
              hukum antara PT Kantiners Indonesia (&quot;Kantiners&quot;) dan
              pemilik usaha makanan/minuman yang terdaftar sebagai mitra
              platform (&quot;Mitra&quot;). Dengan menyelesaikan proses
              pendaftaran dan menggunakan Platform Kantiners, Mitra dianggap
              telah membaca, memahami, dan menyetujui seluruh ketentuan dalam
              dokumen ini.
            </p>
            <p>
              Dokumen ini dirancang untuk melindungi kepentingan kedua belah
              pihak dan memastikan kelangsungan layanan yang baik bagi
              pelanggan.
            </p>
          </div>
        </header>

        {/* 0. Definisi */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            0. Definisi
          </h3>
          <p className="mb-3">
            Istilah-istilah berikut berlaku secara konsisten di seluruh dokumen
            ini:
          </p>
          <ul className="list-disc pl-10 space-y-2">
            <li>
              <strong>&quot;Kantiners&quot;</strong> adalah PT Kantiners
              Indonesia selaku penyedia Platform teknologi.
            </li>
            <li>
              <strong>&quot;Mitra&quot;</strong> adalah pemilik atau pengelola
              Kedai yang telah menandatangani perjanjian kemitraan ini.
            </li>
            <li>
              <strong>&quot;Platform&quot;</strong> adalah aplikasi mobile
              dan/atau web Kantiners beserta seluruh fiturnya.
            </li>
            <li>
              <strong>&quot;Pesanan&quot;</strong> adalah permintaan pembelian
              produk dari Pelanggan yang masuk melalui Platform.
            </li>
            <li>
              <strong>&quot;Komisi&quot;</strong> adalah biaya penggunaan
              platform sebesar Rp1.000,- per item menu yang berhasil terjual.
            </li>
            <li>
              <strong>&quot;Pelanggan&quot;</strong> adalah pengguna akhir yang
              melakukan pemesanan melalui Platform.
            </li>
            <li>
              <strong>&quot;CS&quot;</strong> adalah Customer Service resmi
              Kantiners yang dapat dihubungi melalui WhatsApp Bisnis.
            </li>
            <li>
              <strong>&quot;Hari Kerja&quot;</strong> adalah Senin s.d. Jumat,
              pukul 08.00–17.00 WIB, kecuali hari libur nasional.
            </li>
          </ul>
        </section>

        {/* 1. Pendaftaran & Manajemen Akun Mitra */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            1. Pendaftaran & Manajemen Akun Mitra
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">1.1 Proses Pendaftaran</h4>
              <p className="mb-2">
                Pendaftaran Mitra dibantu sepenuhnya oleh tim Kantiners. Data
                yang wajib diserahkan oleh calon Mitra meliputi:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Nama lengkap Penanggung Jawab Kedai;</li>
                <li>Nama Kedai yang akan ditampilkan di Platform;</li>
                <li>Nomor WhatsApp aktif yang dapat dihubungi.</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm italic">
                  Kantiners berhak menolak permohonan pendaftaran jika ditemukan
                  data yang tidak valid atau tidak memenuhi syarat operasional
                  yang ditetapkan.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-2">1.2 Manajemen Menu</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Tim Kantiners akan membantu proses input menu pada tahap awal
                  onboarding.
                </li>
                <li>
                  Selanjutnya, Mitra diharapkan dapat mengelola menu (harga,
                  gambar, kategori, deskripsi produk, dan modal) secara mandiri
                  melalui fitur yang tersedia di Platform.
                </li>
                <li>
                  Mitra bertanggung jawab atas keakuratan informasi menu yang
                  ditampilkan, termasuk harga, foto produk, dan deskripsi.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-2">1.3 Bantuan Teknis</h4>
              <p className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
                Kantiners menyediakan dukungan teknis bagi Mitra yang mengalami
                kesulitan dalam penggunaan Platform. Bantuan dapat diakses
                melalui jalur CS Mitra yang beroperasi pada Hari Kerja pukul
                08.00–17.00 WIB dengan target respons awal maksimal 2 (dua) jam.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Alur Kerja & Proses Pesanan */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            2. Alur Kerja & Proses Pesanan
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">2.1 Konfirmasi Pesanan</h4>
              <p>
                Mitra wajib merespons setiap Pesanan yang masuk melalui Platform
                dengan memilih salah satu opsi: &quot;Terima&quot; atau
                &quot;Tolak&quot;.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">2.2 Batas Waktu Respons</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Batas waktu maksimal konfirmasi Pesanan adalah 10 menit sejak
                  notifikasi Pesanan diterima.
                </li>
                <li>
                  Jika Mitra tidak memberikan respons dalam batas waktu
                  tersebut, Pelanggan berhak membatalkan Pesanan secara otomatis
                  melalui sistem.
                </li>
                <li>
                  Pesanan yang tidak direspons secara berulang akan menjadi
                  bahan evaluasi kinerja Mitra.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-2">2.3 Penolakan Pesanan</h4>
              <p>
                Jika Mitra memilih &quot;Tolak&quot;, Mitra wajib memberikan
                alasan yang jelas melalui sistem (contoh: &quot;Stok
                Habis&quot;, &quot;Kedai Tutup Sementara&quot;). Penolakan tanpa
                alasan yang valid akan dicatat dalam rekam jejak kinerja Mitra.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">
                2.4 Penerimaan & Estimasi Waktu
              </h4>
              <p className="mb-2">Jika Pesanan diterima, Mitra wajib:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Memberikan estimasi waktu penyiapan yang realistis (pilihan:
                  5, 10, 15, atau 20 menit);
                </li>
                <li>Mematuhi estimasi waktu yang telah ditetapkan;</li>
                <li>
                  Segera menginformasikan melalui fitur chat jika terjadi
                  keterlambatan dari estimasi.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-2">
                2.5 Kebijakan Pengembalian Dana
              </h4>
              <p className="mb-4">
                Bagian ini mengatur prosedur pengembalian dana kepada Pelanggan
                untuk menjamin keadilan dan kualitas layanan di Platform
                Kantiners. Pengajuan refund dapat dilakukan oleh Pelanggan jika
                pengalaman pemesanan tidak sesuai dengan standar operasional
                yang telah ditetapkan.
              </p>

              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h5 className="font-bold text-foreground mb-3 uppercase text-sm tracking-wider">
                    A. Kategori Alasan Refund
                  </h5>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      <strong>Keterlambatan Pengiriman:</strong> Digunakan jika
                      pesanan belum siap atau belum diantar lebih dari estimasi
                      waktu yang diberikan. Dalam kondisi ini, Pelanggan berhak
                      mendapatkan pengembalian dana secara penuh.
                    </li>
                    <li>
                      <strong>Kesalahan Pesanan:</strong> Digunakan jika produk
                      yang diterima tidak sesuai dengan deskripsi, bahan, atau
                      porsi yang tertera di Platform. Refund dapat dilakukan
                      secara parsial pada item yang salah.
                    </li>
                    <li>
                      <strong>Makanan Rusak/Cacat:</strong> Digunakan jika
                      produk diterima dalam kondisi tidak higienis atau rusak
                      secara fisik sehingga tidak layak konsumsi.
                    </li>
                    <li>
                      <strong>Item Kurang:</strong> Digunakan jika terdapat menu
                      yang telah dibayar namun tidak diantarkan ke meja
                      Pelanggan.
                    </li>
                    <li>
                      <strong>Lain-lain:</strong> Digunakan untuk alasan di luar
                      kategori di atas, di mana jumlah dana refund dapat
                      ditentukan berdasarkan kesepakatan bersama.
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h5 className="font-bold text-foreground mb-3 uppercase text-sm tracking-wider">
                    B. Mekanisme Penentuan Nominal Refund
                  </h5>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>
                      <strong>Refund Penuh:</strong> Berlaku otomatis untuk
                      alasan Keterlambatan Pengiriman sebagai kompensasi atas
                      waktu tunggu yang ekstrem.
                    </li>
                    <li>
                      <strong>Refund Parsial:</strong> Untuk alasan Kesalahan
                      Pesanan, Makanan Rusak/Cacat, dan Item Kurang, Pelanggan
                      dapat memilih item spesifik yang bermasalah untuk
                      dikembalikan dananya.
                    </li>
                    <li>
                      <strong>Refund Custom:</strong> Untuk alasan Lain-lain,
                      jumlah dana yang diajukan dapat diinput secara manual
                      sesuai kesepakatan antara Mitra dan Pelanggan. Dengan
                      maksimum harga total order.
                    </li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h5 className="font-bold text-foreground mb-3 uppercase text-sm tracking-wider">
                    C. Status Proses Refund
                  </h5>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      <strong>Menunggu Konfirmasi Kedai:</strong> Status awal
                      saat Pelanggan mengajukan refund dan menunggu respon dari
                      Mitra.
                    </li>
                    <li>
                      <strong>Disetujui:</strong> Mitra telah memverifikasi
                      klaim dan setuju untuk mengembalikan dana sesuai nominal
                      yang diajukan.
                    </li>
                    <li>
                      <strong>Ditolak:</strong> Mitra menolak pengajuan refund,
                      biasanya disertai alasan penolakan yang valid kepada
                      Pelanggan.
                    </li>
                    <li>
                      <strong>Selesai Diproses:</strong> Dana telah berhasil
                      diserahkan kepada Pelanggan dan membutuhkan konfirmasi
                      akhir dari sisi pengguna untuk menutup laporan.
                    </li>
                    <li>
                      <strong>Dibatalkan Pengguna:</strong> Pelanggan
                      membatalkan pengajuan refund secara mandiri sebelum proses
                      selesai.
                    </li>
                    <li>
                      <strong>Dieskalasi:</strong> Kasus dialihkan kepada CS
                      Kantiners sebagai mediator jika terjadi perselisihan atau
                      terdeteksi indikasi kecurangan dalam transaksi.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Skema Komisi & Pembayaran */}
        <section className="mb-8 bg-primary text-primary-foreground p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-4">
            3. Skema Komisi & Pembayaran
          </h3>
          <div className="space-y-6 text-primary-foreground/90">
            <div>
              <h4 className="font-bold text-white mb-2">
                3.1 Model Komisi & Diskon Kuantitas
              </h4>
              <p className="text-sm">
                Biaya penggunaan Platform (Komisi) ditetapkan sebesar{" "}
                <strong>Rp1.000,-</strong> per item menu yang berhasil terjual.
                Sistem menerapkan <strong>diskon 50%</strong> pada total komisi
                pesanan jika kuantitas item dalam satu pesanan tersebut melebihi
                2 (dua) unit. Kantiners berhak menyesuaikan besaran ini dengan
                pemberitahuan minimal 14 hari sebelumnya.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">3.2 Alur Pembayaran</h4>
              <p className="text-sm">
                Pelanggan membayar langsung kepada Mitra. Kantiners tidak
                menampung, memproses, atau menjamin dana pembayaran dari
                Pelanggan. Verifikasi dan konfirmasi bukti pembayaran dari
                Pelanggan adalah tanggung jawab penuh Mitra.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">
                3.3 Pembatalan Komisi akibat Refund
              </h4>
              <p className="text-sm mb-2">
                Jika terjadi pengembalian dana (refund), kewajiban komisi akan
                disesuaikan secara otomatis sebagai berikut:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <strong>Refund Seluruh Item:</strong> Total komisi untuk
                  pesanan tersebut akan dibatalkan sepenuhnya (Rp0,-).
                </li>
                <li>
                  <strong>Refund Sebagian:</strong> Komisi hanya akan dihitung
                  berdasarkan jumlah item yang berhasil terjual dan tidak
                  direfund.
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2">
                3.4 Penyetoran Komisi
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  Mitra wajib menyetorkan total akumulasi Komisi kepada
                  Kantiners setiap hari Minggu (akhir pekan) untuk transaksi
                  yang terjadi dalam satu pekan (Senin s.d. Sabtu).
                </li>
                <li>
                  Batas waktu penyetoran adalah pukul 23.59 WIB pada hari
                  Minggu.
                </li>
                <li>
                  Keterlambatan penyetoran tanpa konfirmasi sebelumnya kepada CS
                  Kantiners dapat dikenakan teguran dan/atau menjadi
                  pertimbangan dalam evaluasi kinerja Mitra.
                </li>
              </ul>
            </div>

            <p className="text-xs italic border-t border-primary-foreground/20 pt-4">
              *Detail lengkap subsidi dan rekonsiliasi dapat diakses melalui
              dashboard mitra.
            </p>
          </div>
        </section>

        {/* 4. Kewajiban & Standar Pelayanan Mitra */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            4. Kewajiban & Standar Pelayanan Mitra
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">4.1 Pengantaran</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Mitra wajib mengantarkan Pesanan yang sudah terkonfirmasi
                  pembayarannya ke nomor meja Pelanggan sesuai data yang tertera
                  di aplikasi.
                </li>
                <li>
                  Pengantaran dilakukan satu kali ke meja yang tertera. Jika
                  Pelanggan tidak berada di meja tersebut, Mitra tidak
                  berkewajiban mencari Pelanggan.
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">4.2 Kualitas & Standar Produk</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Mitra wajib menjaga kualitas, kebersihan, dan higienitas
                  produk yang dijual sesuai standar pangan yang berlaku.
                </li>
                <li>
                  Produk yang diantarkan harus sesuai dengan deskripsi, bahan,
                  dan foto yang tercantum di menu Platform.
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">
                4.3 Ketersediaan Jam Operasional
              </h4>
              <p>
                Mitra diharapkan mengatur jam operasional Kedai secara akurat
                pada Platform.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Evaluasi Kinerja & Konsekuensi */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            5. Evaluasi Kinerja & Konsekuensi
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold mb-2">5.1 Sistem Penilaian</h4>
              <p className="mb-2">
                Kinerja Mitra dinilai melalui dua sumber utama:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Formulir penilaian yang diisi oleh Pelanggan setelah Pesanan
                  selesai (rating dan ulasan tertulis); dan
                </li>
                <li>
                  Data operasional Platform (tingkat respons, ketepatan
                  estimasi, frekuensi penolakan, keterlambatan penyetoran
                  komisi).
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">5.2 Evaluasi Mingguan</h4>
              <p>
                Tim Kantiners akan melakukan evaluasi rutin setiap pekan
                terhadap kinerja Mitra berdasarkan data dan ulasan yang
                terkumpul.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-red-600">
                5.3 Tahapan Sanksi
              </h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>
                  <strong>Peringatan Lisan/Tertulis:</strong> Notifikasi dan
                  sesi evaluasi bersama CS untuk perbaikan.
                </li>
                <li>
                  <strong>Surat Peringatan (SP):</strong> Diberikan jika masalah
                  yang sama berulang setelah peringatan pertama.
                </li>
                <li>
                  <strong>Penangguhan Sementara:</strong> Akun Mitra
                  dinonaktifkan sementara sambil menunggu perbaikan yang
                  disepakati.
                </li>
                <li>
                  <strong>Pemutusan Kemitraan:</strong> Diberikan jika tidak ada
                  perbaikan setelah penangguhan, atau jika terjadi pelanggaran
                  berat.
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* 6. Status & Hubungan Kemitraan */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            6. Status & Hubungan Kemitraan
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4 text-sm">
            <p>
              Hubungan antara Kantiners dan Mitra adalah kemitraan bisnis yang
              bersifat independen, serupa dengan model platform digital dan
              mitra usahanya. Perjanjian ini tidak menciptakan hubungan
              ketenagakerjaan, keagenan, atau perwakilan hukum dalam bentuk
              apapun antara Kantiners dan Mitra.
            </p>
            <p>
              Kantiners adalah penyedia Platform teknologi yang mempertemukan
              Pelanggan dan Mitra. Kantiners tidak bertanggung jawab atas
              kualitas, keamanan, atau higienitas produk, maupun sengketa
              pembayaran langsung antara Mitra dan Pelanggan.
            </p>
          </div>
        </section>

        {/* 7. Penanganan Gangguan Sistem (Server Down) */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            7. Penanganan Gangguan Sistem (Server Down)
          </h3>
          <div className="bg-red-50 p-6 rounded-lg border border-red-100 space-y-4 text-red-800 text-sm">
            <p>
              Jika terjadi gangguan sistem menyeluruh yang berasal dari pihak
              Kantiners, Mitra diharapkan melayani Pelanggan yang datang secara
              manual untuk sementara waktu.
            </p>
            <p>
              Sebagai kompensasi, seluruh biaya Komisi untuk transaksi manual
              yang terjadi pada waktu gangguan berlangsung akan dibebaskan
              (Rp0,-).
            </p>
          </div>
        </section>

        {/* 8. Perlindungan Data & Kerahasiaan */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            8. Perlindungan Data & Kerahasiaan
          </h3>
          <p className="text-sm">
            Kantiners akan menjaga kerahasiaan data operasional Mitra (data
            penjualan, komisi, informasi kontak) dan tidak akan membagikan data
            tersebut kepada pihak ketiga tanpa persetujuan Mitra, kecuali
            diwajibkan oleh hukum.
          </p>
        </section>

        {/* 9. Dukungan Customer Service (CS) */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3 text-blue-800">
            9. Dukungan Customer Service (CS)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 rounded shadow-sm bg-blue-50">
              <h5 className="font-bold mb-1 uppercase text-xs text-blue-700 tracking-wider">
                CS Mitra
              </h5>
              <p className="text-sm">
                Menangani kendala teknis aplikasi, pertanyaan komisi,
                rekonsiliasi data, dan seluruh kebutuhan operasional Mitra.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded shadow-sm bg-white">
              <h5 className="font-bold mb-1 uppercase text-xs text-gray-500 tracking-wider">
                CS Pelanggan
              </h5>
              <p className="text-sm">
                Menangani kendala penggunaan aplikasi dari sisi Pelanggan,
                termasuk sengketa pesanan dan refund.
              </p>
            </div>
          </div>
        </section>

        {/* 10. Ketentuan Penutup */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            10. Ketentuan Penutup
          </h3>
          <p className="text-sm">
            Kantiners berhak mengubah ketentuan dalam dokumen ini sewaktu-waktu.
            Perubahan material akan diberitahukan kepada Mitra melalui
            notifikasi atau pesan CS minimal 14 hari sebelum berlaku.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t-2 border-gray-200">
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-center">
              Pernyataan Persetujuan
            </h3>
            <p className="text-sm mb-8 text-center text-gray-600">
              Dengan menyelesaikan proses pendaftaran dan/atau menggunakan
              Platform Kantiners, Mitra menyatakan telah membaca, memahami, dan
              menyetujui seluruh isi Syarat & Ketentuan Kemitraan ini.
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <div className="flex border-b border-dotted border-gray-400 pb-1">
                <span className="text-sm font-medium w-40">
                  Nama Penanggung Jawab
                </span>
                <span className="text-sm">
                  : .......................................................
                </span>
              </div>
              <div className="flex border-b border-dotted border-gray-400 pb-1">
                <span className="text-sm font-medium w-40">Nama Kedai</span>
                <span className="text-sm">
                  : .......................................................
                </span>
              </div>
              <div className="flex border-b border-dotted border-gray-400 pb-1">
                <span className="text-sm font-medium w-40">Tanggal</span>
                <span className="text-sm">
                  : .......................................................
                </span>
              </div>
              <div className="pt-8 text-center">
                <div className="w-48 h-20 border-b border-gray-400 mx-auto mb-2"></div>
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  Tanda Tangan
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-tight">
            Kantiners • CS Mitra: [Nomor WhatsApp Bisnis Mitra] • CS Pelanggan:
            [Nomor WhatsApp Bisnis Pelanggan]
            <br />
            Dokumen ini berlaku sejak [Tanggal Berlaku] • Versi 1.1
          </div>
        </footer>
      </div>
    </div>
  );
}
