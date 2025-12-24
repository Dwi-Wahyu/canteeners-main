export default function SyaratDanKetentuanMitra() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-gray-800 leading-relaxed text-justify">
      <header className="mb-8 border-b-2 border-green-600 pb-4">
        <h1 className="text-3xl font-bold uppercase mb-2">
          Syarat & Ketentuan Kemitraan
        </h1>
        <h2 className="text-2xl font-semibold text-green-700">
          Kantiners (Canvas)
        </h2>
        <p className="mt-4 text-gray-600 italic">
          Ringkasan pilar-pilar utama perjanjian kemitraan antara Kantiners dan
          Pemilik Kedai (Mitra).
        </p>
      </header>

      {/* 1. Pendaftaran & Manajemen Akun */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
            1
          </span>
          Pendaftaran & Manajemen Akun Mitra
        </h3>
        <ul className="list-disc pl-12 space-y-2">
          <li>Pendaftaran akun dibantu sepenuhnya oleh tim Kantiners.</li>
          <li>
            Data yang wajib disediakan meliputi Nama Penanggung Jawab, Nama
            Kedai, dan Nomor WhatsApp aktif.
          </li>
          <li>
            Tim Kantiners membantu input menu di awal, namun selanjutnya Mitra
            diharapkan mengelola harga, stok, dan deskripsi secara mandiri.
          </li>
          <li>
            Bantuan teknis tetap tersedia jika Mitra mengalami kesulitan dalam
            penggunaan aplikasi.
          </li>
        </ul>
      </section>

      {/* 2. Alur Kerja & Proses Pesanan */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
            2
          </span>
          Alur Kerja & Proses Pesanan
        </h3>
        <ul className="list-disc pl-12 space-y-2">
          <li>
            Mitra wajib merespons setiap pesanan masuk dengan memilih opsi
            "Terima" atau "Tolak".
          </li>
          <li>
            Batas waktu respons maksimal adalah 20 menit; jika terlewati,
            pelanggan berhak membatalkan pesanan secara sepihak 59].
          </li>
          <li>
            Setiap penolakan pesanan wajib disertai alasan yang jelas melalui
            sistem, seperti "Stok Habis".
          </li>
          <li>
            Jika pesanan diterima, Mitra wajib memberikan estimasi waktu
            penyiapan (contoh: 5 hingga 20 menit).
          </li>
          <li>
            Pelanggan berhak mengambil refund langsung di kedai jika pesanan
            tidak sesuai atau belum selesai melebihi estimasi waktu.
          </li>
        </ul>
      </section>

      {/* 3. Skema Komisi & Pembayaran */}
      <section className="mb-8 border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
            3
          </span>
          Skema Komisi & Pembayaran
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Biaya platform atau komisi ditetapkan sebesar Rp 1.000,- (seribu
            rupiah) per item menu yang berhasil terjual 66].
          </li>
          <li>
            Kantiners tidak menampung dana; pelanggan membayar transaksi
            langsung kepada Mitra.
          </li>
          <li>
            Verifikasi bukti pembayaran dari pelanggan merupakan tanggung jawab
            penuh pihak Mitra.
          </li>
          <li>
            Mitra wajib menyetorkan akumulasi total komisi kepada Kantiners
            setiap akhir pekan (weekend).
          </li>
        </ul>
      </section>

      {/* 4. Kewajiban & Standar Pelayanan */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
            4
          </span>
          Kewajiban & Standar Pelayanan Mitra
        </h3>
        <ul className="list-disc pl-12 space-y-2">
          <li>
            Mitra wajib mengantarkan pesanan yang telah dibayar ke nomor meja
            pelanggan sesuai data pada aplikasi.
          </li>
          <li>
            Mitra bertanggung jawab penuh untuk mematuhi estimasi waktu
            penyiapan yang telah diberikan.
          </li>
          <li>
            Menjaga kualitas, kebersihan produk, serta kesesuaian barang dengan
            deskripsi menu adalah kewajiban utama.
          </li>
        </ul>
      </section>

      {/* 5. Evaluasi & Sanksi */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 flex items-center">
          <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
            5
          </span>
          Evaluasi Kinerja & Konsekuensi
        </h3>
        <ul className="list-disc pl-12 space-y-2">
          <li>
            Kinerja dinilai berdasarkan formulir ulasan yang diisi oleh
            pelanggan setelah transaksi selesai 76].
          </li>
          <li>
            Tim Kantiners melakukan evaluasi rutin mingguan terhadap data
            kinerja dan ulasan Mitra.
          </li>
          <li>
            Pelanggaran atau buruknya kinerja secara berulang akan dikenakan
            sanksi bertahap: Peringatan, Surat Peringatan (SP), hingga
            Penangguhan atau Pemutusan kemitraan.
          </li>
        </ul>
      </section>

      {/* 6. Status Kemitraan */}
      <section className="mb-8 bg-gray-100 p-6 rounded-lg border border-gray-300">
        <h3 className="text-xl font-bold mb-3">
          6. Status & Hubungan Kemitraan
        </h3>
        <p className="mb-4">
          Hubungan ini adalah kemitraan mandiri dan bukan merupakan hubungan
          kerja atasan-bawahan, serupa dengan model kerja sama antara Gojek dan
          mitra pengemudinya.
        </p>
        <p>
          Kantiners adalah platform teknologi dan tidak bertanggung jawab atas
          kualitas produk, sengketa pembayaran langsung, atau layanan yang
          diberikan Mitra kepada pelanggan.
        </p>
      </section>

      {/* 7. Gangguan Sistem */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3">
          7. Penanganan Gangguan Sistem (Server Down)
        </h3>
        <ul className="list-disc pl-12 space-y-2 text-red-700">
          <li>
            Jika terjadi gangguan server menyeluruh, Mitra diharapkan tetap
            melayani pelanggan secara manual untuk sementara waktu.
          </li>
          <li>
            Sebagai kompensasi, Kantiners akan membebaskan (menggratiskan) biaya
            komisi untuk seluruh transaksi pada hari terjadinya gangguan
            tersebut.
          </li>
          <li>
            Tim teknis akan berupaya melakukan pemulihan sistem sesegera
            mungkin.
          </li>
        </ul>
      </section>

      {/* 8. Dukungan CS */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-3 text-blue-800">
          8. Dukungan (Customer Service)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-blue-200 rounded shadow-sm bg-blue-50">
            <h4 className="font-bold mb-2 uppercase text-sm">
              CS Khusus Mitra
            </h4>
            <p className="text-sm">
              Menangani kendala teknis aplikasi, pertanyaan seputar komisi, dan
              operasional harian Mitra.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded shadow-sm bg-white">
            <h4 className="font-bold mb-2 uppercase text-sm">
              CS Khusus Pelanggan
            </h4>
            <p className="text-sm">
              Menangani kendala penggunaan aplikasi dari sisi pelanggan umum.
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
        <p>
          Dokumen ini dirancang untuk melindungi kepentingan kedua belah pihak.
        </p>
      </footer>
    </div>
  );
}
