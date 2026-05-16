### /orders/{orderId}

```json
{
    "amount": 15000,
    "customerUserId": "{customerUserId}",
    "disbursementMode": "TRANSFER" | "CASH",
    "lastUpdatedAt": "2025-03-22T10:15:09Z",
    "orderId": "{orderId}",
    "reason": "LATE_DELIVERY" | "SHOP_CANCELLATION" | "WRONG_ORDER" | "DAMAGED_FOOD" | "MISSING_ITEM" | "OTHER",
    "refundId": "{refundId}",
    "requestedAt": "2025-03-22T10:15:01Z",
    "shopOwnerUserId": "{shopOwnerUserId}",
    "status": "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED" | "COMPLETED" | "CANCELLED" | "ESCALATED"
}
```
