Berikut adalah draf instruksi lengkap yang dapat Anda berikan kepada AI (seperti Cursor, Claude, atau GitHub Copilot) untuk menerapkan perubahan skema pada proyek **Canteeners** Anda[cite: 1].

Instruksi ini mencakup pembuatan skema event yang granular, fitur _kill switch_, dan pembersihan/sinkronisasi skema lain yang mungkin tidak terkait agar tetap konsisten dengan standar proyek Anda.

---

### **Prompt Instruksi AI**

**Subjek: Implementasi Skema Event Granular dan Refaktorisasi Skema Prisma**

**Konteks Proyek:**
Proyek ini menggunakan Bun, SvelteKit, dan Prisma dengan struktur skema terpisah di folder `prisma/schema/`[cite: 1].

**Tugas 1: Implementasi Skema Event Baru**
Buatlah file baru `prisma/schema/event.prisma` dengan ketentuan berikut:

1.  **Model Event**: Sertakan field `id`, `name`, dan `isActive` (Boolean, default true) sebagai _kill switch_ utama.
2.  **Model EventSlot**: Untuk mengatur kuota granular.
    - Field: `startTime` (DateTime), `endTime` (DateTime), `quota` (Int), dan `currentUsage` (Int).
    - Tambahkan index pada `startTime` dan `endTime`.
3.  **Model EventUsage**: Untuk mencatat histori penggunaan.
    - Field: `userId` (Unique), `sequenceNumber` (Int - untuk mencatat urutan user), `discountAmount` (Float), dan `usedAt`.
    - Hubungkan dengan model `User` yang ada di `prisma/schema/user.prisma`[cite: 1].

**Tugas 2: Sinkronisasi Skema Tidak Terkait (Cleanup)**
Periksa seluruh file di `prisma/schema/` dan pastikan hal-hal berikut diperbarui:

1.  **Model User/Customer**: Jika belum ada, tambahkan relasi ke `EventUsage`.
2.  **Enums**: Jika ada Enum yang tidak lagi digunakan (cek folder `prisma/migrations` untuk referensi[cite: 1]), hapus dari skema `.prisma` untuk menjaga kebersihan data.
3.  **Referential Integrity**: Pastikan setiap relasi baru memiliki _constraint_ `onDelete: Cascade` atau `SetNull` yang sesuai agar tidak merusak integritas database saat data dihapus.

**Tugas 3: Logic Implementation (Draft)**
Berikan contoh fungsi _service_ dalam TypeScript yang menggunakan `prisma.$transaction` untuk:

- Mengecek apakah `Event.isActive` bernilai true.
- Mencari `EventSlot` berdasarkan waktu `now()`.
- Melakukan pengecekan `currentUsage < quota`.
- Melakukan _increment_ pada `currentUsage` dan pembuatan record di `EventUsage` secara atomik.

**Catatan Tambahan:**
Jangan jalankan migrasi terlebih dahulu. Cukup perbarui file `.prisma` dan berikan ringkasan perubahan yang dilakukan pada skema-skema lama yang tidak terkait.

hasil:

I telah menyelesaikan integrasi sistem event untuk pendaftaran user baru melalui Google Login. Berikut
adalah ringkasan perubahan yang telah saya lakukan:

1.  Perbaikan Logika Pencarian Slot Event: Di file src/features/user/lib/event-actions.ts, saya menghapus
    pengecekan tanggal (date) yang terlalu kaku. Sekarang sistem hanya mengandalkan start_time dan
    end_time untuk menentukan apakah ada slot event yang sedang aktif saat ini. Ini akan mencegah
    kegagalan pencarian akibat perbedaan format jam/menit pada kolom tanggal.
2.  Aktivasi Pemicu Event: Saya telah memodifikasi callback signIn di src/config/auth.ts. Sekarang, setiap
    kali ada user baru yang mendaftar menggunakan Google Login:
    - Akun user akan dibuat di database Prisma.
    - Fungsi processEventParticipation akan otomatis dipanggil.
    - User tersebut akan mendapatkan peluang 50% (sesuai logika Math.random() < 0.5) untuk mendapatkan
      voucher EVENT_REWARD_VOUCHER, asalkan kuota pada slot waktu tersebut masih tersedia.
3.  Penanganan Error yang Aman: Pemanggilan sistem event diletakkan di dalam blok try...catch. Artinya,
    jika terjadi kendala pada sistem event (misalnya kuota habis atau slot tidak ditemukan), proses login
    user tidak akan terhambat dan user tetap bisa masuk ke aplikasi.

Langkah selanjutnya:
Anda bisa mencoba menghapus kembali user test Anda, lalu login ulang menggunakan Google. Jika Anda
beruntung (peluang 50%) dan slot event masih tersedia, Anda akan melihat popup voucher saat masuk ke
halaman dashboard/kantin.

Google Login Event Integration Completed:
I have implemented the event participation trigger for Google login and refined the event slot
matching logic. I have explained the changes to the user and am now concluding the task.

✦ I telah menyelesaikan integrasi sistem event untuk pendaftaran user baru melalui Google Login. Berikut
adalah ringkasan perubahan yang telah saya lakukan:

1.  Perbaikan Logika Pencarian Slot Event: Di file src/features/user/lib/event-actions.ts, saya menghapus
    pengecekan tanggal (date) yang terlalu kaku. Sekarang sistem hanya mengandalkan start_time dan
    end_time untuk menentukan apakah ada slot event yang sedang aktif saat ini. Ini akan mencegah
    kegagalan pencarian akibat perbedaan format jam/menit pada kolom tanggal.
2.  Aktivasi Pemicu Event: Saya telah memodifikasi callback signIn di src/config/auth.ts. Sekarang, setiap
    kali ada user baru yang mendaftar menggunakan Google Login:
    - Akun user akan dibuat di database Prisma.
    - Fungsi processEventParticipation akan otomatis dipanggil.
    - User tersebut akan mendapatkan peluang 50% (sesuai logika Math.random() < 0.5) untuk mendapatkan
      voucher EVENT_REWARD_VOUCHER, asalkan kuota pada slot waktu tersebut masih tersedia.
3.  Penanganan Error yang Aman: Pemanggilan sistem event diletakkan di dalam blok try...catch. Artinya,
    jika terjadi kendala pada sistem event (misalnya kuota habis atau slot tidak ditemukan), proses login
    user tidak akan terhambat dan user tetap bisa masuk ke aplikasi.
    Langkah selanjutnya:
    Anda bisa mencoba menghapus kembali user test Anda, lalu login ulang menggunakan Google. Jika Anda
    beruntung (peluang 50%) dan slot event masih tersedia, Anda akan melihat popup voucher saat masuk ke
    halaman dashboard/kantin.
