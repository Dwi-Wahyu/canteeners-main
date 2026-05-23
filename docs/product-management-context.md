# Konteks Fitur Manajemen Produk Canteeners

Dokumen ini mendokumentasikan skema database produk, arsitektur halaman manajemen produk di Dashboard Kedai, opsi varian produk, serta logika sinkronisasi harga toko di Canteeners.

---

## 1. Skema Database Produk (Prisma Schema)

Model terkait produk didefinisikan dalam [product.prisma](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/prisma/schema/product.prisma). Strukturnya meliputi:

### A. Model `Product`
Menyimpan informasi inti produk makanan/minuman yang dijual oleh suatu kedai (`Shop`).
- `id` (String, CUID): ID unik produk.
- `name` (String): Nama produk.
- `description` (String, Optional): Deskripsi detail produk.
- `image_url` (String): Nama file/URL gambar produk.
- `price` (Float): Harga jual produk ke customer.
- `cost` (Float, Optional): Harga modal/produksi untuk kedai (digunakan untuk kalkulasi margin keuntungan).
- `shop_id` (String): ID Kedai pemilik produk (relasi Cascade).
- `average_rating` / `total_ratings`: Informasi rating produk berdasarkan ulasan pelanggan.
- `is_available` (Boolean, default: `true`): Status ketersediaan stok produk (tersedia atau habis).
- `categories` (`ProductCategory[]`): Relasi many-to-many ke kategori produk.

### B. Varian Produk (`ProductOption` dan `ProductOptionValue`)
Mendukung kustomisasi pesanan (misal: tingkat kepedasan, topping tambahan, tingkat kematangan):

* **`ProductOption` (Grup Pilihan)**:
  - Menyimpan grup varian (contoh: "Tingkat Kepedasan").
  - `is_required` (Boolean): Apakah wajib dipilih oleh pelanggan.
  - `type` (`ProductOptionType`): Berupa pilihan tunggal (`SINGLE`, Radio/Select) atau banyak pilihan (`MULTIPLE`, Checkbox).
* **`ProductOptionValue` (Opsi Pilihan)**:
  - Menyimpan nilai pilihan dalam grup (contoh: "Pedas", "Sedang", "Tidak Pedas").
  - `additional_price` (Float, Optional): Harga tambahan jika memilih opsi ini (misal tambah keju +Rp3.000).

### C. Model `Category` dan `ProductCategory`
Mengelompokkan produk ke dalam kategori global (seperti makanan berat, minuman, camilan).
- `Category`: Menyimpan nama kategori, slug URL, dan ikon gambar.
- `ProductCategory` (Junction Table): Menghubungkan secara dinamis satu produk dengan beberapa kategori.

---

## 2. Struktur Halaman Dashboard Kedai

Halaman manajemen produk khusus untuk pemilik kedai (Shop Owner) terletak di `/app/dashboard-kedai/produk`:

### A. Halaman Utama Produk ([page.tsx](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/app/dashboard-kedai/produk/page.tsx))
- Melakukan verifikasi sesi login dan memastikan pengguna memiliki peran `SHOP_OWNER` serta memiliki `shopId` terdaftar.
- Mengambil parameter filter dari URL menggunakan `ProductSearchParams` (melalui pustaka `nuqs`).
- Memanggil query database secara paralel untuk mengambil produk kedai (`getShopProducts`) dan daftar kategori global (`getCategories`).

### B. Halaman List Produk Client ([client.tsx](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/app/dashboard-kedai/produk/client.tsx))
- **Pencarian & Filter Interaktif**: Menggunakan `useQueryState` untuk mengikat input pencarian nama produk, filter kategori, status ketersediaan (Tersedia/Habis), dan pengurutan (*sorting*: Terbaru, Terlaris, Harga Terendah, Harga Tertinggi) secara langsung ke URL.
- **Tampilan Grid**: Menampilkan daftar produk dalam bentuk kartu (*card*) yang berisi gambar, status ketersediaan, total terjual, harga, dan tombol aksi cepat menuju halaman detail dan halaman edit.
- **Aksi Cepat**: Menyediakan tombol "Input Produk Baru" untuk menambahkan item ke menu kedai.

### C. Halaman Detail Produk Client ([client.tsx](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/app/dashboard-kedai/produk/[product_id]/client.tsx))
- Menampilkan gambar produk, deskripsi, harga, biaya modal (`cost`), dan perhitungan otomatis margin keuntungan (`price - cost`).
- Menyediakan tombol *toggle* instan untuk mengaktifkan/menonaktifkan ketersediaan produk (`ToggleProductAvailableButton`).
- **Kelola Varian**: Menampilkan daftar grup varian (`options`) dan isi opsinya. Menyediakan dialog pop-up untuk menambahkan/mengedit varian baru (`CreateProductOptionDialog`, `ProductOptionClient`) serta tombol untuk menghapus produk (`DeleteProductDialog`).

---

## 3. Logika Server Actions & Sinkronisasi Harga Toko

Seluruh manipulasi data produk dikendalikan oleh server actions pada [product-actions.ts](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/features/product/lib/product-actions.ts):

### A. Penambahan & Pembaruan Produk (`createProduct` & `updateProduct`)
1. Mengurai nominal `price` ke Float, dan nominal `cost` (jika ada) ke Integer.
2. Menyimpan/memperbarui data produk ke tabel `Product` dan menyinkronkan data kategori pada tabel penghubung `ProductCategory`.
3. **Logika Agregasi Harga Toko**:
   Setelah produk ditambahkan atau diubah harganya, sistem menghitung ulang rentang harga menu yang ditawarkan oleh Kedai tersebut secara otomatis:
   - Menghitung nilai minimum (`_min`) dan maksimum (`_max`) dari harga seluruh produk milik kedai terkait yang berstatus aktif (`is_available: true`).
   - Menyimpan nilai hasil perhitungan tersebut kembali ke tabel `Shop` pada field `minimum_price` dan `maximum_price` melalui fungsi pembantu `updateMinimumShopPrice` dan `updateMaximumShopPrice`.
   - Hal ini memastikan filter harga kedai pada halaman pencarian pelanggan selalu akurat dengan harga menu yang aktif saat itu.
4. Menghapus file gambar produk lama dari media penyimpanan jika pemilik kedai memperbarui foto produk (`deleteFile(previousImageUrl)`).

### B. Toggle Ketersediaan Produk (`toggleProductAvailable`)
- Membalikkan status ketersediaan produk (`is_available: !current.is_available`).
- Melakukan revalidasi cache Next.js pada jalur `/dashboard-kedai/produk` agar perubahan status produk langsung terlihat oleh pengguna tanpa memuat ulang halaman secara penuh.

### C. Manajemen Varian & Pilihan (`createProductOption`, `editProductOption`, `deleteProductOption`, dsb.)
- Menambahkan, mengubah, dan menghapus grup varian (`ProductOption`) serta opsi nilainya (`ProductOptionValue`).
- Secara dinamis memicu `revalidatePath` menuju halaman detail produk `/dashboard-kedai/produk/[product_id]` setelah operasi berhasil, agar daftar varian yang dirender di sisi client langsung ter-update secara real-time.
