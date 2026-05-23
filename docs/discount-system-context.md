# Konteks Sistem Diskon Canteeners

Dokumen ini mendokumentasikan skema database diskon dan event, fitur khusus **Event Pengguna Baru (New User Event)**, serta mekanisme penanggungan subsidi komisi antara Platform dengan Kedai.

---

## 1. Skema Database Diskon & Event

Model diskon didefinisikan dalam [discount.prisma](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/prisma/schema/discount.prisma) dan model event didefinisikan dalam [event.prisma](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/prisma/schema/event.prisma).

### A. Model `Discount`
Menyimpan template atau data diskon.
- `id` (String, UUID): ID unik diskon.
- `name` (String): Nama promo/diskon.
- `code` (String, Unique, Optional): Kode voucher unik (misalnya: `EVENT_REWARD_VOUCHER`).
- `type` (`DiscountType`): Tipe potongan (`PERCENTAGE` untuk persentase atau `FIXED` untuk potongan nominal rupiah langsung).
- `value` (Float): Besar potongan (misal `40` untuk 40% atau `10000` untuk Rp10.000).
- `max_discount` (Float, Optional): Batas potongan maksimal untuk tipe `PERCENTAGE`.
- `min_purchase` (Float, Optional): Syarat minimum belanja agar diskon dapat digunakan.
- `shop_id` (String, Optional): Relasi ke kedai (`Shop`) jika diskon diinisiasi oleh kedai tertentu. Jika `null`, berarti ini adalah diskon tingkat platform.
- `category_id` (Int, Optional): Relasi ke kategori produk tertentu.

### B. Model `CustomerDiscount` (Voucher)
Merupakan tabel penghubung (*join table*) yang melacak kepemilikan voucher oleh pelanggan (`Customer`).
- `customer_id` (String): ID Customer pemilik voucher.
- `discount_id` (String): ID Diskon yang dirujuk.
- `is_used` (Boolean): Status apakah voucher sudah digunakan dalam transaksi order.
- `is_seen` (Boolean): Menandai apakah customer sudah melihat popup notifikasi bahwa mereka memenangkan voucher ini.

### C. Model `Event`, `EventSlot`, dan `EventUsage`
Digunakan untuk event berkuota dengan waktu terbatas (misalnya, pembagian voucher pengguna baru):
- `EventSlot`: Menampung kuota (`quota`) dan jumlah pendaftar saat ini (`current_usage`) pada rentang waktu `start_time` hingga `end_time`.
- `EventUsage`: Mencatat partisipasi user dalam slot event secara atomic untuk mencegah *double claim*. Field `sequence_number` menentukan nomor antrean pendaftaran user.

---

## 2. Fitur: Event Pengguna Baru (New User Event)

Event ini dirancang khusus untuk memikat pengguna baru dengan memberikan voucher diskon menarik.

### A. Aturan & Nilai Voucher
- **Diskon**: **40%** dari total belanja.
- **Batas Maksimal**: Potongan harga maksimal **Rp24.000**.
- **Sasaran**: User yang telah login dan berada di masa event/slot waktu yang berjalan aktif.
- **Kode Unik Template**: Dirujuk melalui kode diskon `EVENT_REWARD_VOUCHER` (`type: PERCENTAGE`, `value: 40`, `max_discount: 24000`).

### B. Mekanisme & Flow Partisipasi UI

1. **Popup Deteksi Slot Event ([event-participation-popup.tsx](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/components/event-participation-popup.tsx))**:
   - Komponen ini melacak rute halaman kedai (`/kantin/[slug]`).
   - Apabila terdapat slot event yang aktif (`getActiveEventSlot()`), popup ini muncul di layar secara interaktif dengan waktu hitung mundur (*countdown*) dan sisa kuota yang tersedia.
   - Jika pengguna masih berupa tamu (*guest* atau belum login), menekan tombol **"Daftar Sekarang"** akan mengarahkan pengguna ke halaman login (`/login-pelanggan`).
   
2. **Klaim Voucher saat Login**:
   - Setelah user berhasil masuk, logika autentikasi di [auth.ts](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/config/auth.ts) memicu fungsi `processEventParticipation(userId)`.
   - Secara transaksi aman (database transaction), pendaftaran diverifikasi ke tabel `EventUsage` menggunakan antrean nomor (`sequence_number`).
   - **Logika Keberuntungan (Probability)**: Setiap kelipatan 5 pendaftar (`sequence_number % 5 === 0`), pengguna dinyatakan beruntung dan otomatis dibuatkan catatan `CustomerDiscount` yang mengaitkan mereka dengan diskon `EVENT_REWARD_VOUCHER`.

3. **Popup Voucher Baru ([new-voucher-popup.tsx](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/components/new-voucher-popup.tsx))**:
   - Ketika masuk ke halaman utama, sistem melakukan pengecekan `getUnseenVouchers()` untuk voucher dengan status `is_seen = false` milik user tersebut.
   - Komponen akan merender tampilan tiket voucher berwarna merah bertuliskan nama promo diskon dan tombol **"Klaim"** yang kemudian menandai voucher tersebut telah dilihat (`is_seen = true`).

---

## 3. Sistem Pembagian Beban & Subsidi Diskon

Di masa depan, aplikasi Canteeners mendukung diskon yang dibuat langsung oleh pemilik kedai sendiri (*shop-owner-initiated discounts*) selain diskon global buatan admin platform. Perbedaan utama terletak pada pembagian beban biaya diskon:

### A. Perhitungan Subsidi Platform
Ketika pesanan selesai, kalkulasi keuangan mingguan kedai disimpan dalam model `ShopBilling` melalui server action di [order-actions.ts](file:///home/dwiwahyuilahi/Personal/Projects/Canteeners/source-code/canteeners-main/src/features/order/lib/order-actions.ts#L381-L432).

Beban diskon dihitung berdasarkan keberadaan field `shop_id` pada diskon yang digunakan:
```typescript
const platformSubsidy = order.applied_discounts.reduce((sum, ad) => {
  // Jika discount tidak memiliki shop_id, berarti beban/subsidi ditanggung platform
  if (!ad.discount || ad.discount.shop_id === null) {
    return sum + ad.amount;
  }
  return sum;
}, 0);
```

### B. Dampak ke Billing Kedai
Setiap transaksi pesanan memengaruhi tagihan kedai dengan rumus berikut:
* **`commission_total`**: Bertambah sebesar komisi platform (berdasarkan total kuantiti item pesanan).
* **`subsidy_total`**: Bertambah sebesar total nominal diskon bersubsidi platform (`platformSubsidy`).
* **`net_total` (Utang bersih Kedai ke Platform)**:
  $$\text{net\_total} = \text{commission\_total} - \text{subsidy\_total}$$

1. **Diskon Platform (Disubsidi)**:
   - Karena `discount.shop_id === null`, nilai diskon ini masuk ke `platformSubsidy`.
   - Nilai ini mengurangi jumlah `net_total` tagihan kedai. Hal ini karena kedai terpaksa memotong harga jual produk untuk customer demi program platform, sehingga platform mengganti kerugian kedai tersebut dengan memotong tagihan komisi mingguan mereka.

2. **Diskon Inisiasi Kedai (Tidak Disubsidi - Rencana Masa Depan)**:
   - Pemilik kedai membuat promo tersendiri, sehingga diskon tersimpan dengan field `shop_id` berisi ID kedai mereka (`discount.shop_id !== null`).
   - Saat order selesai, logika di `order-actions.ts` **tidak memasukkan** nilai diskon kedai ini ke dalam variabel `platformSubsidy`.
   - Hasilnya, nilai `subsidy_total` tidak bertambah untuk transaksi tersebut, dan tagihan komisi bersih (`net_total`) kedai tetap penuh. Kedai menanggung sendiri 100% potongan harga yang mereka berikan ke customer.
