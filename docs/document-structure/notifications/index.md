# /notifications/{notificationId}

## Notification Intent

```
type NotificationIntent =
  | "DEFAULT"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
```

## Notification Button

```typescript
type NotificationButton = {
  label: string;
  actionPath: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};
```

## Field Structure

- `type`: `NotificationType`
- `subType`: `string`
- `recipientId`: `string`
- `resourcePath`: `string` (Backward compatibility)
- `createdAt`: `Timestamp`
- `isRead`: `boolean`
- `title`: `string`
- `body`: `string`
- `intent`: `NotificationIntent`
- `buttons`: `NotificationButton[]` (Optional)
- `duration`: `number` (Optional, 0 for persistent)
- `showLoadingBar`: `boolean` (Optional)
- `metadata`: `Record<string, any>` (Optional)

