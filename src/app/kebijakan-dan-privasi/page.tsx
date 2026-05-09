import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";

export const dynamic = "force-dynamic";

export default function KebijakanPrivasi() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <TopbarWithBackButton title="Kebijakan Privasi Pengguna" backUrl="/" />

      <div className="px-5 pt-24 space-y-8">
        <header>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Bagaimana Kami Melindungi Data Anda dengan Ketat dan Transparan
          </h2>
        </header>

        <section className="mb-8">
          <p className="mb-4">
            Keamanan dan privasi data Anda adalah prioritas utama kami.
            Kebijakan Privasi ini menjelaskan bagaimana platform Kantiners
            mengumpulkan, menggunakan, membagikan, dan melindungi informasi
            pribadi Pengguna saat menggunakan layanan kami.
          </p>
          <p className="italic">
            Dengan mengakses atau menggunakan aplikasi Kantiners, Anda
            menyetujui praktik pengelolaan data yang dijelaskan dalam dokumen
            ini.
          </p>
        </section>

        {/* 1. Data Apa yang Kami Kumpulkan? */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            1. Data Apa yang Kami Kumpulkan?
          </h3>
          <p className="mb-4">
            Untuk memberikan pengalaman pemesanan yang cepat dan aman, kami
            merancang sistem pengumpulan data yang sangat minim dan efisien.
            Kami mengumpulkan informasi dalam dua kategori utama:
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-bold mb-2">Data Akses & Akun Pengguna:</h4>
              <p className="text-sm mb-2">
                Kami mendesain platform ini agar inklusif dan mudah diakses.
                Anda dapat menggunakan layanan kami secara instan melalui{" "}
                <strong>Mode Tamu (Guest Mode)</strong>, di mana kami tidak
                mengumpulkan data profil atau akun apa pun dari Anda.
              </p>
              <p className="text-sm">
                Namun, jika Anda memilih untuk mendaftar guna mendapatkan
                pengalaman yang lebih lengkap (seperti menyimpan riwayat
                pesanan), akses akun hanya membutuhkan{" "}
                <strong>Alamat Email aktif Anda</strong>. Kami tidak menggunakan
                sistem kata sandi (password) dan tidak meminta data pribadi
                tambahan lainnya.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold mb-2 text-gray-800">
                Data Transaksional:
              </h4>
              <p className="text-sm">
                Saat Anda melakukan pemesanan (baik menggunakan akun maupun
                melalui Guest Mode), kami mengumpulkan Detail Pesanan, Nomor
                Meja, serta foto Bukti Pembayaran.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Mengapa Kami Membutuhkan Data Anda? */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            2. Mengapa Kami Membutuhkan Data Anda?
          </h3>
          <p className="mb-3">
            Informasi yang kami kumpulkan digunakan semata-mata untuk kelancaran
            layanan, meliputi:
          </p>
          <ul className="list-disc pl-8 space-y-2">
            <li>
              <strong>Memproses Pesanan:</strong> Meneruskan detail pesanan Anda
              ke pihak kedai yang tepat agar makanan dapat disiapkan.
            </li>
            <li>
              <strong>Operasional Layanan:</strong> Memastikan pesanan Anda
              diantarkan secara presisi ke nomor meja yang tepat.
            </li>
            <li>
              <strong>Verifikasi Pembayaran:</strong> Memastikan bahwa transaksi
              pemesanan yang dilakukan adalah valid dan sah.
            </li>
            <li>
              <strong>Mengelola Akun:</strong> Memverifikasi identitas Anda saat
              proses login melalui email, serta mengirimkan komunikasi penting
              terkait status pesanan Anda.
            </li>
          </ul>
        </section>

        {/* 3. Dengan Siapa Data Anda Dibagikan? */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            3. Dengan Siapa Data Anda Dibagikan?
          </h3>
          <p className="mb-4">
            Kantiners tidak pernah menjual data pribadi Anda. Data hanya
            dibagikan untuk keperluan operasional kepada:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-700 mb-1">
                Pihak Eksternal (Mitra Kantin):
              </h4>
              <p className="text-sm">
                Kami hanya membagikan Detail Pesanan dan Nomor Meja kepada
                penjual.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-700 mb-1">
                Pihak Internal (Tim Aplikasi):
              </h4>
              <p className="text-sm">
                Akses data diberikan secara sangat terbatas hanya kepada
                developer atau tim teknis Kantiners untuk tujuan pemeliharaan
                sistem dan operasional.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-700 mb-1">Otoritas hukum:</h4>
              <p className="text-sm">
                Bila diwajibkan oleh hukum, pengadilan, atau regulator.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-bold text-gray-700 mb-1">
                Penyedia layanan pihak ketiga:
              </h4>
              <p className="text-sm">
                Server hosting, email, notifikasi, analitik, dan keamanan. Data
                dibatasi dan tunduk kerahasiaan.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Bagaimana Kami Mengamankan Data Anda? */}
        <section className="mb-8 bg-primary text-primary-foreground p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold mb-3">
            4. Bagaimana Kami Mengamankan Data Anda?
          </h3>
          <p className="mb-4 text-blue-100">
            Kami menerapkan standar keamanan teknis untuk melindungi data Anda:
          </p>
          <ul className="list-disc pl-6 space-y-4">
            <li>
              <strong>Keamanan Tanpa Kata Sandi (Passwordless):</strong> Dengan
              tidak menggunakan kata sandi (password) untuk login, akun Anda
              terhindar dari risiko pencurian atau peretasan kata sandi. Akses
              sepenuhnya bergantung pada keamanan email pribadi Anda.
            </li>
            <li>
              <strong>Pembatasan Akses:</strong> Data sistem dan transaksi hanya
              dapat diakses oleh personel internal yang memiliki otorisasi dan
              kepentingan operasional langsung.
            </li>
          </ul>
        </section>

        {/* 5. Berapa Lama Data Anda Disimpan? */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            5. Berapa Lama Data Anda Disimpan?
          </h3>
          <ul className="list-disc pl-8 space-y-2">
            <li>
              <strong>Data Akun:</strong> Informasi alamat email Anda akan terus
              disimpan selama akun Anda masih berstatus aktif di platform kami.
            </li>
            <li>
              <strong>Riwayat Percakapan (Chat):</strong> Untuk menghemat ruang
              penyimpanan dan menjaga privasi, riwayat percakapan antara
              Pengguna dan Mitra Kedai akan dihapus secara otomatis dari sistem
              setelah 30 hari terhitung sejak tanggal transaksi dilakukan.
            </li>
          </ul>
        </section>

        {/* 6. Hak dan Kontrol Pengguna */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            6. Hak dan Kontrol Pengguna
          </h3>
          <p className="mb-3">
            Anda memiliki kendali penuh atas informasi pribadi Anda di dalam
            platform:
          </p>
          <ul className="list-disc pl-8 space-y-2">
            <li>
              <strong>Akses Data:</strong> Anda memiliki kendali penuh atas akun
              Anda. Mengingat satu-satunya data profil yang terikat adalah
              alamat email, riwayat pesanan Anda akan selalu tersinkronisasi
              dengan email tersebut.
            </li>
            <li>
              <strong>Penghapusan Akun:</strong> Saat ini, fitur penghapusan
              akun mandiri di dalam aplikasi belum tersedia. Namun, Anda tetap
              memiliki hak untuk menghapus akun beserta data riwayat transaksi
              Anda dengan cara mengajukan permohonan manual melalui tim Customer
              Service kami.
            </li>
          </ul>
        </section>

        {/* 7. Pembaruan Kebijakan */}
        <section className="mb-8">
          <h3 className="text-xl font-bold mb-3 border-l-4 border-primary pl-3">
            7. Pembaruan Kebijakan
          </h3>
          <p>
            Kantiners berhak memperbarui Kebijakan Privasi ini di masa mendatang
            apabila terdapat penambahan fitur baru yang memengaruhi cara kami
            memproses data pengguna. Setiap perubahan material akan
            diberitahukan kepada Pengguna melalui aplikasi.
          </p>
        </section>

        <footer className="mt-12 pt-6 border-t text-xs text-gray-500 text-center italic">
          <p>Kebijakan Privasi Pengguna • Versi 1.0</p>
        </footer>
      </div>
    </div>
  );
}
