# 🔐 Модерация и Контроль Доступа

## Новые Возможности

### 1. Лимит Участников для Events
- Организатор может указать максимальное количество участников
- Система автоматически блокирует вступление когда лимит достигнут
- Если не указано - количество участников неограничено

### 2. Модерация Вступления в Events
- Организатор может включить ручное одобрение участников
- Пользователи отправляют запрос на вступление (статус `PENDING`)
- Организатор видит список запросов и может одобрить или отклонить
- После одобрения участник получает доступ к чату топика

### 3. Контроль Личных Сообщений
- Пользователи могут запретить получать личные сообщения
- Настройка в профиле пользователя (`allow_direct_messages`)
- Если запрещено - кнопка "Написать" будет недоступна

## Применение Миграции

### Шаг 1: Откройте Supabase SQL Editor
1. Перейдите в [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Откройте **SQL Editor** в боковом меню

### Шаг 2: Выполните SQL скрипт
1. Скопируйте содержимое файла `supabase/migrations/002_add_moderation_features.sql`
2. Вставьте в SQL Editor
3. Нажмите **Run** (или Ctrl/Cmd + Enter)

### Шаг 3: Проверьте результат
Выполните следующий запрос чтобы убедиться что миграция применена:

```sql
-- Проверка новых колонок в items
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' 
AND column_name IN ('max_participants', 'requires_approval', 'current_participants');

-- Проверка новой таблицы chat_participants
SELECT * FROM information_schema.tables WHERE table_name = 'chat_participants';

-- Проверка функции is_event_full
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'is_event_full';
```

Если все 3 запроса возвращают результаты - миграция успешно применена! ✅

## Новые API Endpoints

### 1. **POST /api/items/[id]/join**
Пользователь присоединяется к Event или откликается на Task

**Request Body:**
```json
{
  "userId": "123456789",
  "message": "I want to join!" // опционально для Tasks
}
```

**Response:**
```json
{
  "success": true,
  "participant": {
    "id": "uuid",
    "item_id": "uuid",
    "user_id": "123456789",
    "status": "PENDING" // или "APPROVED" если не требуется модерация
  },
  "requiresApproval": true,
  "message": "Join request sent. Waiting for approval."
}
```

### 2. **GET /api/items/[id]/join?status=PENDING**
Получить список запросов на вступление (для организатора)

**Query Params:**
- `status` (optional): `PENDING`, `APPROVED`, `REJECTED`, `LEFT`

**Response:**
```json
{
  "participants": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "user_id": "123456789",
      "status": "PENDING",
      "joined_at": "2025-01-28T12:00:00Z",
      "user": {
        "id": "123456789",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://...",
        "reputation": 4.8
      }
    }
  ]
}
```

### 3. **PATCH /api/items/[id]/join/[participantId]**
Одобрить или отклонить запрос на вступление

**Request Body:**
```json
{
  "status": "APPROVED", // или "REJECTED"
  "authorId": "987654321" // ID организатора
}
```

**Response:**
```json
{
  "success": true,
  "participant": { /* updated participant */ },
  "message": "Participant approved!"
}
```

### 4. **DELETE /api/items/[id]/join/[participantId]?userId=123**
Пользователь покидает Event или организатор выгоняет участника

## UI Components

### CreateDrawer
Новые поля для Events:

```tsx
// Max Participants (опционально)
<input 
  type="number"
  min="2"
  placeholder="Unlimited"
  value={formData.maxParticipants}
  onChange={(e) => setFormData({ maxParticipants: e.target.value })}
/>

// Requires Approval Toggle
<Toggle 
  checked={formData.requiresApproval}
  onChange={(val) => setFormData({ requiresApproval: val })}
/>
```

### ItemDrawer
Для Events с модерацией показывать:

```tsx
{item.requires_approval ? (
  <SlideButton text="Request to Join" />
) : (
  <SlideButton text="Join Event" />
)}
```

Для организатора показывать вкладку "Join Requests":

```tsx
{isOwner && item.type === 'EVENT' && (
  <Tab name="join-requests">
    {pendingParticipants.map(p => (
      <ParticipantCard 
        participant={p}
        onApprove={() => approveParticipant(p.id)}
        onReject={() => rejectParticipant(p.id)}
      />
    ))}
  </Tab>
)}
```

## Примеры Использования

### Создание Event с Лимитом
```typescript
const eventData = {
  type: 'EVENT',
  title: 'Футбол на районе',
  description: 'Играем в футбол',
  max_participants: 10, // Максимум 10 человек
  requires_approval: true, // Ручная модерация
  ...
};

await createItem(eventData);
```

### Проверка Заполненности Event
```typescript
const { data: isFull } = await supabase
  .rpc('is_event_full', { event_id: 'uuid' });

if (isFull) {
  alert('Event is full!');
}
```

### Одобрение Участника
```typescript
const response = await fetch(`/api/items/${itemId}/join/${participantId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    status: 'APPROVED',
    authorId: currentUser.id,
  }),
});
```

## База Данных

### Новая Таблица: `chat_participants`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| item_id | UUID | FK to items |
| user_id | BIGINT | FK to users |
| status | TEXT | PENDING, APPROVED, REJECTED, LEFT |
| joined_at | TIMESTAMPTZ | Время запроса |
| approved_at | TIMESTAMPTZ | Время одобрения |
| approved_by | BIGINT | FK to users (кто одобрил) |

### Новые Колонки в `items`

| Column | Type | Description |
|--------|------|-------------|
| max_participants | INTEGER | NULL = unlimited |
| requires_approval | BOOLEAN | Default: false |
| current_participants | INTEGER | Auto-updated by trigger |

### Новые Колонки в `users`

| Column | Type | Description |
|--------|------|-------------|
| allow_direct_messages | BOOLEAN | Default: true |
| auto_accept_responses | BOOLEAN | Default: true |

## Telegram Integration

### Создание Топиков
После создания item автоматически вызывается:

```typescript
POST /api/telegram/create-group
{
  "itemId": "uuid",
  "title": "Футбол на районе",
  "type": "EVENT"
}
```

Ответ сохраняется в `items.telegram_topic_id` и `items.telegram_chat_id`.

### Модерация Доступа к Топику
- Если `requires_approval = true`, новые участники не могут писать в топик пока не одобрены
- После одобрения бот может дать права на запись (через Telegram Bot API)

## Troubleshooting

### Миграция не применяется
- Проверьте что у вас есть права администратора в Supabase
- Убедитесь что предыдущая миграция (`001_initial_schema.sql`) уже применена

### Топики не создаются
- Проверьте что `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` настроены в `.env.local`
- Убедитесь что бот добавлен в группу как администратор с правами `can_manage_topics`

### Ошибка "Event is full"
- Проверьте значение `max_participants` в таблице `items`
- Проверьте количество участников со статусом `APPROVED` в `chat_participants`

## Дальнейшие Улучшения

- [ ] Уведомления Telegram при одобрении/отклонении запроса
- [ ] История изменений участников Event
- [ ] Автоматическое закрытие Event при достижении лимита
- [ ] Waitlist для заполненных Events
- [ ] Приоритетная очередь для пользователей с высоким reputation
