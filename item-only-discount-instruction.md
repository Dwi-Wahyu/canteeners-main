Saya telah memodifikasi skema perhitungan diskon untuk mendukung jenis voucher yang hanya memotong "Harga
Menu" saja, tanpa mengurangi "Biaya Layanan (Komisi)". Berikut adalah perubahan yang telah dilakukan:

1.  Logika Pemotongan Khusus: Pada src/features/cart/lib/cart-actions.ts, saya menambahkan konstanta
    ITEM_ONLY_DISCOUNT_CODES. Voucher dengan kode EVENT_REWARD_VOUCHER kini akan dihitung berdasarkan
    total harga produk saja.
    - Contoh: Jika Harga Menu Rp 50.000 dan Komisi Rp 2.000 (Total Rp 52.000). Voucher diskon 10% jenis
      ini akan memotong Rp 5.000 (10% dari 50rb), bukan Rp 5.200.
    - Perlindungan Komisi: Sistem memastikan potongan tidak akan melebihi total harga menu, sehingga
      biaya layanan tetap utuh untuk operasional.
2.  Kemudahan Modifikasi: Saya merancang kode agar mudah diubah. Jika kedepannya Anda ingin menambahkan
    voucher dengan skema serupa, Anda cukup menambahkan kode vouchernya ke dalam array
    ITEM_ONLY_DISCOUNT_CODES di file cart-actions.ts dan shop-cart-client.tsx.
3.  Ringkasan Harga yang Transparan: Memperbarui UI pada src/features/cart/ui/shop-cart-client.tsx untuk
    menampilkan rincian harga yang lebih mendetail sebelum checkout:
    _ Total Harga Menu: Menampilkan total harga item yang dibeli.
    _ Total Biaya Layanan: Menampilkan komisi/biaya tambahan secara terpisah.
    _ Total Potongan: Menampilkan nominal diskon yang didapat.
    _ Total Pembayaran: Menampilkan hasil akhir yang harus dibayar pelanggan.
    Dengan rincian ini, pelanggan dapat melihat dengan jelas komponen biaya apa saja yang mereka bayar dan
    berapa besar potongan yang mereka dapatkan secara spesifik.
