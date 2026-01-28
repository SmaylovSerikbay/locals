# 🏗️ LOCALS - Архитектура проекта

## 📐 Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Mini App                         │
│                     (Next.js 15)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├──────────────────────────┐
                            ↓                          ↓
                  ┌──────────────────┐       ┌─────────────────┐
                  │  Vercel Edge     │       │  Supabase       │
                  │  Functions       │←──────│  PostgreSQL     │
                  │  (API Routes)    │       │  + PostGIS      │
                  └──────────────────┘       └─────────────────┘
                            │                          │
                            ↓                          ↓
                  ┌──────────────────┐       ┌─────────────────┐
                  │ Telegram Bot API │       │  Real-time      │
                  │  (Webhooks)      │       │  Subscriptions  │
                  └──────────────────┘       └─────────────────┘
```

## 🗂️ Структура проекта

```
locals/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Интернационализация
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── page.tsx           # Main page
│   │   ├── api/                   # API Routes (Backend)
│   │   │   ├── users/
│   │   │   │   ├── route.ts       # GET, POST users
│   │   │   │   └── [id]/route.ts  # GET, PATCH user
│   │   │   ├── items/
│   │   │   │   ├── route.ts       # GET, POST items
│   │   │   │   ├── [id]/route.ts  # GET, PATCH, DELETE
│   │   │   │   ├── [id]/responses/route.ts
│   │   │   │   ├── [id]/complete/route.ts
│   │   │   │   └── nearby/route.ts
│   │   │   ├── responses/
│   │   │   │   └── [id]/route.ts  # PATCH response status
│   │   │   ├── messages/
│   │   │   │   └── route.ts       # GET, POST messages
│   │   │   ├── reviews/
│   │   │   │   └── route.ts       # GET, POST reviews
│   │   │   └── telegram/
│   │   │       ├── create-group/route.ts
│   │   │       ├── webhook/route.ts
│   │   │       └── set-webhook/route.ts
│   │   ├── favicon.ico
│   │   └── globals.css
│   ├── components/                # React компоненты
│   │   ├── Map.tsx               # Карта с маркерами
│   │   ├── MapWrapper.tsx        # SSR обертка
│   │   ├── BottomDock.tsx        # Нижняя панель навигации
│   │   ├── ItemDrawer.tsx        # Детали item
│   │   ├── CreateDrawer.tsx      # Создание item
│   │   ├── ChatListDrawer.tsx    # Список чатов
│   │   ├── ProfileDrawer.tsx     # Профиль пользователя
│   │   ├── SearchDrawer.tsx      # Поиск
│   │   ├── TelegramInit.tsx      # Инициализация Telegram
│   │   └── ui/
│   │       └── SlideButton.tsx   # Slide-to-respond
│   ├── store/                     # Zustand state management
│   │   ├── useItemsStore.ts      # Items + API integration
│   │   ├── useChatStore.ts       # Chats + messages
│   │   ├── useUserStore.ts       # User + auth
│   │   ├── useCreateStore.ts     # Create flow
│   │   └── useSearchStore.ts     # Search state
│   ├── lib/
│   │   └── supabase.ts           # Supabase client
│   ├── types/
│   │   ├── supabase.ts           # Database types
│   │   └── telegram.d.ts         # Telegram types
│   ├── i18n/                      # Интернационализация
│   │   ├── request.ts
│   │   └── routing.ts
│   ├── messages/                  # Переводы
│   │   ├── en.json
│   │   └── ru.json
│   ├── utils/
│   │   └── cleanupChats.ts
│   └── middleware.ts              # Next.js middleware
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # SQL schema
├── public/                        # Static assets
├── .env.example                   # Example env vars
├── .env.local                     # Local env vars (gitignored)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── README.md
├── QUICKSTART.md                  # Быстрый старт
├── DEPLOYMENT.md                  # Инструкция деплоя
├── CHECKLIST.md                   # Чеклист перед запуском
├── API_REFERENCE.md               # Документация API
├── ARCHITECTURE.md                # Этот файл
└── TELEGRAM_SETUP.md              # Настройка Telegram
```

## 🔄 Data Flow

### 1. Создание Item

```
User создает item
     ↓
CreateDrawer → useItemsStore.createItem()
     ↓
POST /api/items
     ↓
Supabase INSERT items
     ↓
Trigger: update_location() → устанавливает geography
     ↓
Response с полным item
     ↓
Zustand store обновляется
     ↓
Map.tsx ре-рендерится → новый маркер
     ↓
Real-time broadcast → другие пользователи получают обновление
```

### 2. Telegram Forum Topic

```
Item создан
     ↓
useChatStore.createGroupChat()
     ↓
POST /api/telegram/create-group
     ↓
Telegram Bot API → createForumTopic
     ↓
Topic ID получен
     ↓
UPDATE items SET telegram_topic_id, telegram_chat_id
     ↓
Chat в приложении + ссылка на Telegram
```

### 3. Сообщения (двусторонняя синхронизация)

**App → Telegram:**
```
User пишет в app
     ↓
useChatStore.sendMessage()
     ↓
POST /api/messages
     ↓
Supabase INSERT messages
     ↓
TODO: Send to Telegram topic (будущая фича)
```

**Telegram → App:**
```
User пишет в Telegram topic
     ↓
Telegram Webhook → POST /api/telegram/webhook
     ↓
Находим item по telegram_topic_id
     ↓
Upsert user в БД
     ↓
INSERT message в БД
     ↓
Real-time broadcast → все подписчики получают
     ↓
useChatStore обновляется → UI обновляется
```

### 4. Отклики на задачи

```
User откликается на task
     ↓
POST /api/items/[id]/responses
     ↓
Supabase INSERT responses (unique: item_id, user_id)
     ↓
Автор получает уведомление (TODO)
     ↓
Автор принимает/отклоняет → PATCH /api/responses/[id]
     ↓
Если ACCEPTED:
  - UPDATE responses: другие → REJECTED
  - UPDATE items: executor_id = user_id, status = IN_PROGRESS
     ↓
Real-time broadcast → все получают обновление
```

### 5. Reputation System

```
Task завершена (status = COMPLETED)
     ↓
POST /api/reviews
     ↓
Validation: только author ↔ executor могут оставлять отзывы
     ↓
Supabase INSERT reviews
     ↓
Trigger: update_user_reputation()
     ↓
SELECT AVG(rating) WHERE target_user_id = X
     ↓
UPDATE users SET reputation = AVG
     ↓
User profile обновляется
```

## 🗄️ Database Schema

### Основные таблицы

```sql
users (id: BIGINT PK)
  ├─ username, first_name, last_name
  ├─ avatar_url, reputation (AVG of reviews)
  └─ language_code, is_active

items (id: UUID PK)
  ├─ type: TASK | EVENT
  ├─ title, description
  ├─ price, currency (for TASK)
  ├─ event_date (for EVENT)
  ├─ latitude, longitude, location (geography)
  ├─ status: OPEN | IN_PROGRESS | COMPLETED
  ├─ author_id → users
  ├─ executor_id → users
  └─ telegram_topic_id, telegram_chat_id

responses (id: UUID PK)
  ├─ item_id → items
  ├─ user_id → users
  ├─ message
  ├─ status: PENDING | ACCEPTED | REJECTED
  └─ UNIQUE(item_id, user_id)

messages (id: UUID PK)
  ├─ item_id → items
  ├─ sender_id → users
  ├─ text
  ├─ telegram_message_id (для синхронизации)
  └─ is_system

reviews (id: UUID PK)
  ├─ item_id → items
  ├─ author_id → users
  ├─ target_user_id → users
  ├─ rating (1-5)
  ├─ text
  └─ UNIQUE(item_id, author_id, target_user_id)
```

### Indexes

```sql
-- Geospatial для быстрого поиска nearby
CREATE INDEX idx_items_location ON items USING GIST(location);

-- Фильтрация по статусу
CREATE INDEX idx_items_status ON items(status) 
  WHERE status IN ('OPEN', 'IN_PROGRESS');

-- Сортировка сообщений
CREATE INDEX idx_messages_item_created 
  ON messages(item_id, created_at DESC);
```

### Functions

```sql
nearby_items(lat, lng, radius_meters, item_type)
  → Возвращает items в радиусе с distance_meters

update_user_reputation()
  → Trigger после INSERT review
  → Обновляет AVG(rating) пользователя
```

## 🔐 Security

### Row Level Security (RLS)

```sql
-- Users: все могут читать, только владелец может обновлять
users: SELECT (public), UPDATE (id = auth.uid())

-- Items: все могут читать, автор может обновлять/удалять
items: SELECT (public), UPDATE/DELETE (author_id = auth.uid())

-- Responses: все могут создавать, автор item может обновлять
responses: INSERT (authenticated), UPDATE (via API)

-- Messages: все могут создавать
messages: INSERT (authenticated), SELECT (public)

-- Reviews: только участники могут оставлять
reviews: INSERT (authenticated)
```

### Environment Variables

```
NEXT_PUBLIC_* - доступны на клиенте (безопасно)
SUPABASE_SERVICE_ROLE_KEY - только на сервере (секретно)
```

## 🚀 Performance

### Optimization strategies

1. **Database:**
   - PostGIS для географических запросов (O(log n))
   - Indexes на frequently queried columns
   - Denormalized data для быстрого доступа

2. **API:**
   - Vercel Edge Functions (< 50ms cold start)
   - Pagination для больших списков
   - Caching user data локально (Zustand persist)

3. **Frontend:**
   - Dynamic imports для Map компонента (SSR: false)
   - Real-time подписки только для активных items
   - Optimistic UI updates

4. **Real-time:**
   - Supabase Realtime (websockets)
   - Подписка только на нужные таблицы/фильтры
   - Автоматический reconnect

## 🔄 State Management

### Zustand Stores

```typescript
// useItemsStore
- items: Item[] (кеш всех загруженных items)
- fetchNearbyItems() → GET /api/items/nearby
- createItem() → POST /api/items
- subscribeToItems() → Supabase Realtime

// useChatStore (persist)
- chats: Chat[] (локальный кеш чатов)
- fetchMessages() → GET /api/messages
- sendMessage() → POST /api/messages
- subscribeToMessages() → Supabase Realtime

// useUserStore (persist)
- user: User (текущий пользователь)
- syncUserWithAPI() → POST /api/users (upsert)
```

## 📱 Telegram Integration

### Web App

```javascript
window.Telegram.WebApp.initDataUnsafe.user
  → User data от Telegram
  → Синхронизируется с Supabase через API
```

### Bot API

```
createForumTopic → Создание топиков для items
sendMessage → Приветственные сообщения
setWebhook → Получение обновлений от Telegram
```

### Webhook Flow

```
Telegram → webhook → /api/telegram/webhook
  → Parse update
  → Upsert user
  → Insert message
  → Broadcast via Supabase Realtime
```

## 🧪 Testing Strategy

### Unit Tests (TODO)
- API routes logic
- Zustand store actions
- Utility functions

### Integration Tests (TODO)
- API endpoints
- Database queries
- Telegram webhook

### E2E Tests (TODO)
- User flows (create item, respond, chat)
- Telegram integration
- Real-time sync

## 📊 Monitoring

### Vercel
- Function logs
- Performance metrics
- Error tracking

### Supabase
- Database metrics
- API logs
- Real-time connections

### Telegram
- Webhook status
- Message delivery

## 🔮 Future Improvements

1. **Performance:**
   - Redis caching для frequently accessed data
   - CDN для static assets
   - Image optimization

2. **Features:**
   - Push notifications
   - Payment integration
   - Reviews moderation
   - Advanced search

3. **Infrastructure:**
   - Multiple regions deployment
   - Load balancing
   - Automated backups

---

## 📚 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15, React 19 | Web app framework |
| UI | Tailwind CSS, Framer Motion | Styling & animations |
| State | Zustand | Client state management |
| Database | Supabase (PostgreSQL + PostGIS) | Data storage & geo queries |
| Real-time | Supabase Realtime | Live updates |
| API | Next.js API Routes | Backend logic |
| Hosting | Vercel | Serverless deployment |
| Maps | React Leaflet, OpenStreetMap | Interactive map |
| i18n | next-intl | Internationalization |
| Integration | Telegram Bot API | Chat & auth |

---

Архитектура спроектирована для:
- ✅ Быстрого прототипирования
- ✅ Горизонтального масштабирования
- ✅ Минимальных издержек (serverless)
- ✅ Real-time возможностей
- ✅ Geographic queries производительности

🚀 **Ready for production!**
