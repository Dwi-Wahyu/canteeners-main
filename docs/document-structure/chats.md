### /chats/{chatId}

```
{
  "id": "{buyerId}_{sellerId}",

  "participantIds": [
    "{buyerId}",
    "{sellerId}"
  ],

  "buyerId": "{buyerId}",
  "sellerId": "{sellerId}",

  "lastMessage": "Pesannya masih tersedia?",
  "lastMessageType": "text",
  "lastMessageAt": "2025-03-22T10:15:09Z",
  "lastMessageSenderId": "{buyerId}"

  "unreadCountGuest": 0,
  "unreadCountOwner": 2,

  "typing": ['{ownerId}', '{buyerId}'],

  "createdAt": "2025-03-22T10:00:00Z",
  "updatedAt": "2025-03-22T10:15:09Z"
}
```

### /chats/{chatId}/messages/{messageId}

```
{
  "id": "{messageId}",
  "senderId": "{buyerId}",

  "type": "text",
  "text": "Pesannya masih tersedia?",
  "imageUrl": null,

  "media": [
    {
      "url": "chat-attachments/msg_010_1.jpg",
      "path": "chat-media/msg_010_1.jpg",
      "contentType": "image/jpeg",
      "size": 245678
    }
  ],

  "readBy": ["{buyerId}"],

  "createdAt": "2025-03-22T10:15:09Z"
}
```
