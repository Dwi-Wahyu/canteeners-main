export default function SyaratDanKetentuanPelanggan() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-gray-800 leading-relaxed">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold uppercase mb-2">
          Syarat & Ketentuan Pengguna Layanan
        </h1>

        <h2 className="text-2xl font-semibold text-blue-600">Canteeners</h2>
      </header>

      <section className="mb-8">
        <p className="mb-4 italic">
          Selamat datang di Canteeners. Dengan mendaftar dan menggunakan
          platform kami, Anda ("Pengguna") dianggap telah membaca, memahami, dan
          menyetujui seluruh isi Syarat dan Ketentuan ("S&K") ini.
        </p>
      </section>

      {/* 1. Akun Pengguna */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">1. Akun Pengguna</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Pendaftaran:</strong> Layanan Canteeners terbuka untuk umum.
            Pengguna wajib memberikan data yang benar dan akurat saat
            pendaftaran.
          </li>

          <li>
            <strong>Tanggung Jawab:</strong> Pengguna bertanggung jawab penuh
            atas semua aktivitas yang terjadi di dalam akunnya, termasuk menjaga
            kerahasiaan kata sandi.
          </li>

          <li>
            <strong>Data Tidak Akurat:</strong> Jika ditemukan Pengguna
            memberikan data yang tidak benar atau palsu, Tim Canteeners berhak
            melakukan evaluasi dan memberikan sanksi penangguhan (suspend) akun.
          </li>

          <li>
            <strong>Penutupan Akun:</strong> Pengguna yang ingin menghapus
            akunnya secara permanen dapat mengajukan permohonan kepada tim kami
            melalui kontak Customer Service (CS).
          </li>
        </ul>
      </section>

      {/* 2. Proses Pemesanan & Pembayaran */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          2. Proses Pemesanan & Pembayaran
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Mekanisme:</strong> Pembayaran pesanan dilakukan secara
            langsung oleh Pengguna ke rekening milik Kedai (Mitra).
          </li>

          <li>
            <strong>Bukti Pembayaran:</strong> Pengguna wajib mengunggah bukti
            pembayaran (misalnya, tangkapan layar/screenshot) yang jelas dan sah
            untuk setiap transaksi.
          </li>

          <li>
            <strong>Pesanan Ditinggal:</strong> Kedai hanya berkewajiban
            mengantarkan pesanan ke meja yang diinput sebanyak satu kali. Jika
            Pengguna tidak berada di meja tersebut, menjadi tanggung jawab
            Pengguna untuk mengonfirmasi ulang (melalui fitur chat) atau
            mengambil pesanannya langsung ke Kedai.
          </li>
        </ul>
      </section>

      {/* 3. Sanksi Pembatalan */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          3. Sanksi Pembatalan oleh Pengguna
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Definisi Pembatalan:</strong> Sanksi ini berlaku untuk
            Pengguna yang telah menekan tombol "Pesan" namun tidak menyelesaikan
            proses pembayaran hingga batas waktu habis ("cancel sebelum bayar").
          </li>

          <li>
            <strong>Aturan Sanksi:</strong> Pengguna yang melakukan pembatalan
            seperti definisi di atas sebanyak 3 (tiga) kali dalam satu hari yang
            sama, akan dinonaktifkan sementara.
          </li>

          <li>
            <strong>Konsekuensi Sanksi:</strong> Akun yang dinonaktifkan
            sementara tidak dapat melakukan pemesanan kembali selama sisa hari
            tersebut dan baru dapat memesan lagi di hari berikutnya.
          </li>
        </ul>
      </section>

      {/* 4. Pembatalan oleh Kedai & Refund */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          4. Pembatalan oleh Kedai & Proses Refund
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Hak Refund Pelanggan:</strong> Pengguna berhak mendapatkan
            pengembalian dana (refund) jika Kedai membatalkan pesanan setelah
            pembayaran dilakukan (stok habis) atau jika Kedai terlambat
            mengantar pesanan melebihi estimasi waktu.
          </li>

          <li>
            <strong>Mekanisme Refund:</strong> Pihak Kedai memiliki fitur untuk
            mengajukan refund dan berkewajiban untuk mentransfer dana
            pengembalian secara langsung ke Pengguna.
          </li>

          <li>
            <strong>Peran Advokasi CS:</strong> Jika terjadi perselisihan atau
            keterlambatan dalam proses refund dari Kedai, Pengguna dapat
            menghubungi CS. Tim Canteeners akan bertindak sebagai mediator dan
            mengadvokasi Pengguna untuk memastikan pengembalian dana
            diselesaikan oleh Kedai.
          </li>
        </ul>
      </section>

      {/* 5. Penanganan Gangguan Sistem */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          5. Penanganan Gangguan Sistem & Sengketa
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Sistem Error (Down):</strong> Jika terjadi gangguan pada
            aplikasi Canteeners (server down, error massal), Pengguna diizinkan
            melakukan pemesanan secara manual langsung ke Kedai.
          </li>

          <li>
            <strong>Proses Manual:</strong> Dalam proses manual tersebut,
            Pengguna wajib menunjukkan bukti pembayaran kepada Kedai untuk
            verifikasi.
          </li>

          <li>
            <strong>Peran CS saat Error:</strong> Meskipun aplikasi error,
            layanan CS melalui WhatsApp akan tetap aktif untuk menjadi penengah
            dan membantu mediasi antara Pengguna dan Kedai.
          </li>

          <li>
            <strong>Sengketa Pembayaran:</strong> Untuk sengketa pembayaran, CS
            Canteeners akan bertindak sebagai mediator aktif dan menghubungi
            pihak Kedai secara langsung untuk menyelesaikan masalah.
          </li>
        </ul>
      </section>

      {/* 6. Aturan Ulasan */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          6. Aturan Ulasan (Review) Pengguna
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Konten Dilarang:</strong> Pengguna dilarang menulis ulasan
            yang mengandung kata-kata kasar (vulgar), unsur SARA, fitnah, spam,
            atau promosi pribadi.
          </li>

          <li>
            <strong>Sanksi Ulasan:</strong> Pengguna yang melanggar aturan
            konten ulasan akan mendapatkan peringatan. Jika pelanggaran
            berlanjut, tim Canteeners berhak untuk mencabut fitur review dari
            akun atau banned Pengguna tersebut.
          </li>
        </ul>
      </section>

      {/* 7. Larangan Umum */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          7. Larangan Umum & Perlindungan Aset
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Larangan Keras:</strong> Pengguna dilarang keras melakukan
            upaya peretasan (hacking), reverse engineering, atau tindakan teknis
            lainnya yang bertujuan merusak sistem Canteeners. Sanksi untuk
            pelanggaran ini adalah pemblokiran (ban) permanen secara langsung
            atau penyelesaian melalui jalur hukum.
          </li>

          <li>
            <strong>Properti Intelektual:</strong> Pengguna dilarang menggunakan
            nama, logo, poster, atau aset merek ("Canteeners") lainnya untuk
            kepentingan komersial atau pribadi tanpa izin tertulis.
          </li>
        </ul>
      </section>

      {/* 8. Ketentuan Penutup */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">8. Ketentuan Penutup</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Layanan Pelanggan (CS):</strong> Dukungan penuh, mediasi,
            dan advokasi disediakan melalui saluran Customer Service resmi via
            WhatsApp Bisnis.
          </li>
          <li>
            <strong>Perubahan S&K:</strong> Canteeners berhak mengubah S&K ini
            sewaktu-waktu. Perubahan akan dianggap berlaku efektif setelah
            diposting di platform kami.
          </li>

          <li>
            <strong>Kaitan dengan Kebijakan Privasi:</strong> Dengan menyetujui
            S&K ini, Pengguna juga menyatakan telah membaca dan menyetujui
            Kebijakan Privasi Canteeners.
          </li>
        </ul>
      </section>
    </div>
  );
}
