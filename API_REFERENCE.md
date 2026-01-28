# 📚 LOCALS API Reference

Полная документация всех API endpoints.

## 🔐 Authentication

Все запросы используют Telegram user ID для идентификации. Нет необходимости в токенах JWT.

---

## 👤 Users API

### POST /api/users

Создать или обновить пользователя (upsert).

**Request:**
```json
{
  "id": 123456,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://...",
  "language_code": "en"
}
```

**Response:**
```json
{
  "user": {
    "id": 123456,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "avatar_url": "https://...",
    "reputation": 5.0,
    "language_code": "en",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/users

Получить всех пользователей с пагинацией.

**Query params:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/users/[id]

Получить пользователя по ID.

**Response:**
```json
{
  "user": { ... }
}
```

### PATCH /api/users/[id]

Обновить пользователя.

**Request:**
```json
{
  "username": "new_username",
  "first_name": "New Name"
}
```

---

## 📦 Items API

### GET /api/items

Получить все items с фильтрами.

**Query params:**
- `type` (optional): "TASK" | "EVENT"
- `status` (optional): "OPEN" | "IN_PROGRESS" | "COMPLETED"
- `author_id` (optional): user ID
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "TASK",
      "title": "Help with moving",
      "description": "Need help moving 5 boxes",
      "price": 15,
      "currency": "USD",
      "event_date": null,
      "latitude": 43.238949,
      "longitude": 76.889709,
      "status": "OPEN",
      "author_id": 123456,
      "executor_id": null,
      "telegram_topic_id": 123,
      "telegram_chat_id": "-1003836967887",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "author": {
        "id": 123456,
        "username": "john",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://...",
        "reputation": 5.0
      },
      "responses": [
        {
          "id": "uuid",
          "user_id": 789,
          "message": "I can help!",
          "status": "PENDING",
          "created_at": "2024-01-01T00:00:00Z",
          "user": { ... }
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

### GET /api/items/nearby

Получить items рядом с координатами.

**Query params:**
- `lat` (required): latitude
- `lng` (required): longitude
- `radius` (optional, default: 5000): radius in meters
- `type` (optional): "TASK" | "EVENT"

**Response:**
```json
{
  "items": [
    {
      ...item,
      "distance_meters": 1234.56
    }
  ]
}
```

### POST /api/items

Создать новый item.

**Request:**
```json
{
  "type": "TASK",
  "title": "Help with moving",
  "description": "Need help moving 5 boxes",
  "price": 15,
  "currency": "USD",
  "latitude": 43.238949,
  "longitude": 76.889709,
  "author_id": 123456
}
```

**Response:**
```json
{
  "item": { ... }
}
```

### GET /api/items/[id]

Получить item по ID со всеми связанными данными.

**Response:**
```json
{
  "item": {
    ...item,
    "author": { ... },
    "executor": { ... },
    "responses": [ ... ],
    "reviews": [ ... ]
  }
}
```

### PATCH /api/items/[id]

Обновить item.

**Request:**
```json
{
  "title": "New title",
  "status": "IN_PROGRESS"
}
```

### DELETE /api/items/[id]

Удалить item.

**Response:**
```json
{
  "success": true
}
```

### POST /api/items/[id]/complete

Завершить задачу.

**Request:**
```json
{
  "user_id": 123456
}
```

---

## 💬 Responses API

### GET /api/items/[id]/responses

Получить все отклики на item.

**Response:**
```json
{
  "responses": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "user_id": 789,
      "message": "I can help!",
      "status": "PENDING",
      "created_at": "2024-01-01T00:00:00Z",
      "user": { ... }
    }
  ]
}
```

### POST /api/items/[id]/responses

Создать отклик на item.

**Request:**
```json
{
  "user_id": 789,
  "message": "I can help with this!"
}
```

**Response:**
```json
{
  "response": { ... }
}
```

### PATCH /api/responses/[id]

Обновить статус отклика (принять/отклонить).

**Request:**
```json
{
  "status": "ACCEPTED",
  "author_id": 123456
}
```

**Response:**
```json
{
  "response": { ... }
}
```

**Notes:**
- Только автор item может обновлять статус откликов
- При `ACCEPTED` все остальные отклики автоматически отклоняются
- Item status меняется на `IN_PROGRESS`
- `executor_id` устанавливается на `user_id` отклика

---

## 💬 Messages API

### GET /api/messages

Получить сообщения для item.

**Query params:**
- `item_id` (required): UUID item
- `limit` (optional, default: 100)
- `before` (optional): timestamp для пагинации

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "sender_id": 123456,
      "text": "Hello!",
      "telegram_message_id": 789,
      "is_system": false,
      "created_at": "2024-01-01T00:00:00Z",
      "sender": {
        "id": 123456,
        "username": "john",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### POST /api/messages

Отправить сообщение.

**Request:**
```json
{
  "item_id": "uuid",
  "sender_id": 123456,
  "text": "Hello, world!",
  "is_system": false
}
```

**Response:**
```json
{
  "message": { ... }
}
```

---

## ⭐ Reviews API

### GET /api/reviews

Получить отзывы.

**Query params:**
- `target_user_id` (optional): ID пользователя, о котором отзывы
- `item_id` (optional): ID item

**Response:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "author_id": 123456,
      "target_user_id": 789,
      "rating": 5,
      "text": "Great work!",
      "created_at": "2024-01-01T00:00:00Z",
      "author": { ... },
      "target_user": { ... },
      "item": {
        "id": "uuid",
        "title": "Task title",
        "type": "TASK"
      }
    }
  ]
}
```

### POST /api/reviews

Оставить отзыв.

**Request:**
```json
{
  "item_id": "uuid",
  "author_id": 123456,
  "target_user_id": 789,
  "rating": 5,
  "text": "Great work!"
}
```

**Response:**
```json
{
  "review": { ... }
}
```

**Rules:**
- Rating must be 1-5
- Item must be COMPLETED
- Only author or executor can leave reviews
- Author reviews executor, executor reviews author
- Reputation automatically updated

---

## 📱 Telegram API

### POST /api/telegram/create-group

Создать Telegram forum topic для item.

**Request:**
```json
{
  "itemId": "uuid",
  "title": "Event title",
  "itemType": "EVENT"
}
```

**Response:**
```json
{
  "success": true,
  "chatId": "topic_uuid",
  "topicId": 123,
  "deepLink": "https://t.me/c/1234567/123",
  "forumChatId": "-1003836967887",
  "instructions": "Topic created in forum group"
}
```

### POST /api/telegram/webhook

Webhook endpoint для получения обновлений от Telegram.

**Automatically called by Telegram** when:
- New message in forum topic
- User joins/leaves

### POST /api/telegram/set-webhook

Установить webhook URL.

**Request (optional):**
```json
{
  "webhook_url": "https://your-domain.com/api/telegram/webhook"
}
```

**Response:**
```json
{
  "success": true,
  "webhook_url": "https://...",
  "webhook_info": {
    "url": "https://...",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

### GET /api/telegram/set-webhook

Проверить текущий webhook.

**Response:**
```json
{
  "url": "https://...",
  "has_custom_certificate": false,
  "pending_update_count": 0
}
```

---

## 🔄 Real-time Subscriptions

Используйте Supabase Realtime для подписки на изменения:

```typescript
// Items
supabase
  .channel('items-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'items'
  }, (payload) => {
    console.log('Item changed:', payload);
  })
  .subscribe();

// Messages
supabase
  .channel('messages-{item_id}')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `item_id=eq.{item_id}`
  }, (payload) => {
    console.log('New message:', payload);
  })
  .subscribe();
```

---

## ❌ Error Responses

Все ошибки возвращаются в формате:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Rate Limits

- **Development**: No limits
- **Production**: 
  - 100 requests per minute per IP
  - 1000 requests per hour per user

---

## 📊 Performance Tips

1. **Use nearby endpoint** вместо fetching all items
2. **Implement pagination** для больших списков
3. **Subscribe to real-time** только для активных items
4. **Cache user data** локально
5. **Batch requests** когда возможно

---

Полный код примеров: см. `src/store/` и `src/components/`
