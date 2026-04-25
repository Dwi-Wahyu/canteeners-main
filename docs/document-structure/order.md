### /orders/{orderId}

```json
{
  "id": "{orderId}",
  "shopId": "{shopId}",
  "status": "PENDING_CONFIRMATION" | "WAITING_PAYMENT" | "WAITING_SHOP_CONFIRMATION" | "PROCESSING" | "COMPLETED" | "REJECTED" | "CANCELLED",
  "customerName": "Budi Santoso",
  "items": [
    {
      "name": "Nasi Goreng",
      "price": 15000,
      "quantity": 2,
      "subtotal": 31000, // Termasuk komisi
      "note": "Pedas"
    }
  ],
  "totalPrice": 31000,
  "lastUpdatedAt": "2025-03-22T10:15:09Z"
}
```
