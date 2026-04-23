**Konteks Proyek:** Sistem pembayaran kantin menggunakan Next.js dan Firebase. Saat ini sudah berjalan container **Piper TTS** di `localhost:10200` dan **Wyoming-HTTP Bridge** di `localhost:10201`.

**Tugas Integrasi:**
Buatlah alur otomatisasi suara notifikasi pembayaran dengan ketentuan berikut:

1.  **Monitor Firestore Trigger:**
    - Scan koleksi `transactions` atau `payments`.
    - Gunakan `onSnapshot` (Client-side) atau Cloud Functions (Server-side) untuk mendeteksi dokumen baru dengan status `SUCCESS` atau `SETTLEMENT`.

2.  **Logic Speech Synthesis (Server-Side Route):**
    - Buat API Route di Next.js (misal: `/api/tts/generate`).
    - Input: `amount` dan `orderId`.
    - Lakukan normalisasi angka ke teks (contoh: 15000 -> "Lima belas ribu rupiah").
    - Fetch ke Piper Bridge: `http://localhost:10201/api/tts?text=[TEXT]`.
    - Simpan buffer audio hasil fetch ke **Firebase Storage** di folder `notifications/`.
    - Update dokumen transaksi di Firestore dengan field `audioUrl` yang berisi link download dari Firebase Storage.

3.  **Real-time Playback (Dashboard Pemilik):**
    - Di sisi Dashboard Next.js, buatlah listener Firestore yang memantau transaksi masuk khusus milik kedai tersebut.
    - Jika ditemukan dokumen baru dengan `audioUrl`, segera trigger `new Audio(audioUrl).play()`.

4.  **Referensi Kode & Standar:**
    - Gunakan **TypeScript**.
    - Gunakan **Firebase Admin SDK** untuk operasi server-side.
    - Pastikan ada penanganan error jika container Piper tidak merespons (fallback ke notifikasi visual saja).
    - Implementasikan pembersihan (cleanup) file audio di Storage yang sudah lebih dari 24 jam untuk menghemat kuota Firebase.

---

### **Arsitektur Integrasi yang Harus Diikuti Agent:**

1.  **Firebase Firestore:** Sebagai _Source of Truth_ status pembayaran.
2.  **Next.js Backend (atau Cloud Function):** Sebagai orkestrator yang memanggil Piper.
3.  **Piper TTS (Self-hosted):** Mesin penghasil suara `.wav`.
4.  **Firebase Storage:** Hosting file audio agar bisa diakses oleh perangkat kasir di mana saja.

### **Tips Tambahan untuk Anda (Lead Developer):**

- **Keamanan:** Karena Piper berjalan di `localhost`, pastikan API Route Next.js Anda memiliki proteksi (misal mengecek `auth` Firebase) agar tidak sembarang orang bisa men-generate audio dan membengkakkan biaya Firebase Storage Anda.
- **Latency:** Menggunakan Firebase Storage akan menambah sedikit latency dibandingkan menyimpan di folder `public` lokal. Namun, ini lebih aman jika perangkat kasir (laptop/tablet) berbeda dengan server tempat Docker berjalan.

Apakah Anda ingin saya memberikan contoh kode spesifik untuk bagian **Firebase Cloud Function**-nya?
