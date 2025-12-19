## Refund

### Refund diajukan (PENDING)

```
{
  "type": "REFUND",
  "subType": "REQUESTED",

  "recipientId": "{shop_owner_user_id}",
  "resourcePath": "/order/{orderId}/refund",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Permintaan Refund Baru",
  "body": "Customer mengajukan refund sebesar Rp{amount} untuk pesanan #{orderId}",

  "metadata": {
    "refundId": "{refund_id}",
    "amount": 40000,
    "reason": "WRONG_ORDER"
  },

  "intent": "INFO"
}
```

### Refund ditolak

```
{
  "type": "REFUND",
  "subType": "REJECTED",

  "recipientId": "{customer_user_id}",
  "resourcePath": "/order/{orderId}/refund",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Refund Ditolak",
  "body": "Permintaan refund untuk pesanan ini ditolak",

  "metadata": {
    "rejectedReason": "Bukti tidak cukup"
  },

  "intent": "ERROR"
}
```

### Dana refund sudah dikirim (PROCESSED)

```
{
  "type": "REFUND",
  "subType": "DISBURSED",

  "recipientId": "{customer_user_id}",
  "resourcePath": "/order/{orderId}/refund",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Dana Refund Telah Dikirim",
  "body": "Dana refund sebesar Rp{amount} telah dikirim melalui {disbursement_mode}",

  "intent": "SUCCESS"
}
```

### Refund dibatalkan oleh customer

```
{
  "type": "REFUND",
  "subType": "CANCELLED",

  "recipientId": "{shop_owner_user_id}",
  "resourcePath": "/order/{orderId}/refund",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Refund Dibatalkan",
  "body": "Customer membatalkan permintaan refund untuk pesanan ini",

  "intent": "INFO"
}
```
