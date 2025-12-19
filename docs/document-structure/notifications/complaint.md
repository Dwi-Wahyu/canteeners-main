## COMPLAINT

### Complaint diajukan

```
{
  "type": "COMPLAINT",
  "subType": "SUBMITTED",

  "recipientId": "{shop_owner_user_id}",
  "resourcePath": "/order/{orderId}/complaint",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Komplain Baru dari Customer",
  "body": "Customer mengajukan komplain untuk pesanan #{orderId}"
}
```

### Complaint sedang ditinjau

```
{
  "type": "COMPLAINT",
  "subType": "UNDER_REVIEW",

  "recipientId": "{customer_user_id}",
  "resourcePath": "/order/{orderId}/complaint",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Komplain Sedang Ditinjau",
  "body": "Pemilik kedai sedang meninjau komplain Anda",

  "intent": "INFO"
}
```

### Complaint diselesaikan

```
{
  "type": "COMPLAINT",
  "subType": "RESOLVED",

  "recipientId": "{customer_user_id}",
  "resourcePath": "/order/{orderId}/complaint",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Komplain Diselesaikan",
  "body": "Komplain Anda telah diselesaikan oleh pihak kedai",

  "intent": "SUCCESS"
}
```

### Complaint ditolak

```
{
  "type": "COMPLAINT",
  "subType": "REJECTED",

  "recipientId": "{customer_user_id}",
  "resourcePath": "/order/{orderId}/complaint",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Komplain Ditolak",
  "body": "Komplain Anda ditolak karena tidak memenuhi syarat",

  "metadata": {
    "reason": "Bukti tidak valid"
  },

  "intent": "WARNING"
}
```

### Complaint dieskalasi ke admin

```
{
  "type": "COMPLAINT",
  "subType": "ESCALATED",

  "recipientId": "{admin_user_id}",
  "resourcePath": "/admin/complaints/{complaintId}",
  "createdAt": "2025-12-19T10:10:00Z",
  "isRead": false,

  "title": "Komplain Perlu Penanganan Admin",
  "body": "Komplain pada pesanan #{orderId} dieskalasi ke admin",

  "intent": "ERROR"
}
```
