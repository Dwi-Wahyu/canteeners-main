## Order

### New Order

```
{
  "type": "ORDER",
  "subType": "CREATED",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/order/{orderId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Pesanan Baru Masuk",
  "body": "Pesanan {jumlah_item_order} item oleh {nama_customer} dengan total {total_harga}, tolong segera ditinjau",

  "senderInfo": {
    "name": "Budi Santoso"
  },

  "metadata": {
    "orderId": "{order_id}",
    "itemCount": "{jumlah_item_order}",
    "totalPrice": 40000
  },

  "intent": "INFO"

}
```

### Pesanan Diterima

```
{
  "type": "ORDER",
  "subType": "ACCEPTED",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/order/{orderId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Pesanan Diterima",
  "body": "Silakan kirim bukti pembayaran",

  "intent": "SUCCESS"
}
```

### Pesanan ditolak

```
{
  "type": "ORDER",
  "subType": "REJECTED",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/order/{orderId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Pesanan Ditolak",
  "body": "Maaf pesanan ditolak oleh penjual",

  "metadata": {
    "rejectedReason": "Stok salah satu item habis"
  },

  "intent": "WARNING"
}

```

### Customer mengirim bukti pembayaran

```
{
  "type": "ORDER",
  "subType": "PAYMENT_PROOF_SUBMITTED",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/order/{orderId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Customer Mengirim Bukti Pembayaran",
  "body": "Tolong validasi bukti pembayaran oleh {nama_customer}",

  "senderInfo": {
    "name": "Budi Santoso"
  },

  "intent": "INFO"
}

```

### Pembayaran Disetujui

```
{
  "type": "ORDER",
  "subType": "PAYMENT_APPROVED",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/order/{orderId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Bukti Pembayaran Sudah Disetujui!",
  "body": "Kedai telah memproses pesanan anda dengan estimasi {estimasi} menit",

  "intent": "SUCCESS"
}

```

### Pesanan siap (makan di tempat)

```
{
  "type": "ORDER",
  "subType": "READY_DINE_IN",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/chat/{chatId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Pesanan Kamu Sudah Siap Diantar",
  "body": "Konfirmasi kembali dengan pemilik kedai untuk catatan tambahan",

  "intent": "SUCCESS"
}
```

### Pesanan selesai (takeaway)

```
{
  "type": "ORDER",
  "subType": "READY_TAKEAWAY",

  "recipientId": "{user_id_penerima}",
  "resourcePath": "/chat/{chatId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Pesanan Kamu Sudah Selesai!",
  "body": "Silakan ambil pesanan di kedai",

  "intent": "SUCCESS"
}
```
