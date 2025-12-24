export default function KebijakanPrivasi() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-gray-800 leading-relaxed text-justify">
      <header className="mb-8 border-b-2 border-blue-500 pb-4">
        <h1 className="text-3xl font-bold uppercase mb-2">
          Privacy Policy Canvas
        </h1>
        <h2 className="text-2xl font-semibold text-blue-700">Kantiners</h2>
        <p className="mt-4 text-gray-600 italic">
          Ringkasan visual untuk memahami pilar-pilar utama Kebijakan Privasi
          Kantiners.
        </p>
      </header>

      {/* 1. Data Apa yang Dikumpulkan? */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 border-l-4 border-blue-600 pl-3">
          1. Data Apa yang Dikumpulkan?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2 text-blue-800">
              Data Akun Pengguna:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Username </li>
              <li>Alamat Email </li>
              <li>Password yang terenkripsi </li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2 text-gray-800">
              Data Transaksional:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Detail Pesanan </li>
              <li>Nomor Meja </li>
              <li>Bukti Pembayaran </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Mengapa Data Dibutuhkan? */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 border-l-4 border-blue-600 pl-3">
          2. Mengapa Data Dibutuhkan?
        </h3>
        <ul className="list-disc pl-8 space-y-2">
          <li>
            <strong>Memproses Pesanan:</strong> Meneruskan detail pesanan ke
            kedai yang benar.
          </li>
          <li>
            <strong>Mengelola Akun:</strong> Mengamankan login dan komunikasi
            penting terkait akun.
          </li>
          <li>
            <strong>Verifikasi Pembayaran:</strong> Memastikan transaksi pesanan
            valid.
          </li>
          <li>
            <strong>Operasional Layanan:</strong> Memastikan pesanan diantar ke
            meja yang tepat.
          </li>
        </ul>
      </section>

      {/* 3. Dengan Siapa Data Dibagikan? */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 border-l-4 border-blue-600 pl-3">
          3. Dengan Siapa Data Dibagikan?
        </h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold text-gray-700">
              Pihak Eksternal (Kantin):
            </h4>
            <p className="text-sm">
              Dibagikan data berupa Nama Pemesan, Detail Pesanan, dan Nomor Meja
              untuk keperluan penyiapan pesanan.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-bold text-gray-700">
              Pihak Internal (Tim Aplikasi):
            </h4>
            <p className="text-sm">
              Akses terbatas hanya diberikan kepada developer untuk tujuan
              operasional dan pemeliharaan sistem.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Bagaimana Data Diamankan? */}
      <section className="mb-8 bg-blue-900 text-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-3">4. Bagaimana Data Diamankan?</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Pembatasan Akses:</strong> Data hanya dapat diakses oleh
            personel yang memiliki otorisasi dan kepentingan langsung.
          </li>
          <li>
            <strong>Enkripsi Password:</strong> Kata sandi pengguna disimpan
            dalam format yang terenkripsi dan tidak dapat dibaca oleh sistem
            maupun admin.
          </li>
        </ul>
      </section>

      {/* 5. Berapa Lama Data Disimpan? */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 border-l-4 border-blue-600 pl-3">
          5. Berapa Lama Data Disimpan?
        </h3>
        <ul className="list-disc pl-8 space-y-2">
          <li>
            <strong>Data Akun:</strong> Disimpan selama akun pengguna masih
            aktif.
          </li>
          <li>
            <strong>Riwayat Percakapan:</strong> Dihapus secara otomatis dari
            sistem setelah 30 hari sejak tanggal transaksi.{" "}
          </li>
        </ul>
      </section>

      {/* 6. Apa Hak & Kontrol Pengguna? */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 border-l-4 border-blue-600 pl-3">
          6. Apa Hak & Kontrol Pengguna?
        </h3>
        <ul className="list-disc pl-8 space-y-2">
          <li>
            <strong>Akses & Perubahan Data:</strong> Pengguna dapat melihat dan
            mengubah data profil seperti username, email, password, dan WhatsApp
            di halaman pengaturan akun.
          </li>
          <li>
            <strong>Penghapusan Akun:</strong> Fitur hapus mandiri belum
            tersedia. Penghapusan akun dapat diajukan secara manual dengan
            menghubungi tim kami.
          </li>
        </ul>
      </section>

      {/* 7. Cara Menghubungi Kami */}
      <section className="mb-8 p-6 bg-gray-50 border border-gray-300 rounded-lg text-center">
        <h3 className="text-xl font-bold mb-3">7. Cara Menghubungi Kami</h3>
        <p className="mb-4 text-sm">
          Untuk semua pertanyaan dan permintaan terkait privasi, hubungi kami
          melalui:
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <span className="font-semibold">WhatsApp: +62 812-3456-7890</span>
          <span className="hidden md:inline">|</span>
          <span className="font-semibold">Email: support@canteeners.com</span>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-sm text-gray-500 italic">
        <p>
          8. Kebijakan ini dapat diperbarui di masa mendatang jika ada
          penambahan fitur baru yang memengaruhi data pengguna.
        </p>
      </footer>
    </div>
  );
}
