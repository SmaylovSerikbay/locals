# LOCALS - Telegram Mini App

Hyper-local map-based app for connecting neighbors through tasks and events.

## Features

- 🗺️ **Map-First Interface** - Interactive map with location-based tasks and events
- 📦 **Tasks** - Request help from nearby neighbors
- 🎉 **Events (Dvizh)** - Find people to hang out with
- 💬 **Group Chats** - Automatic chat creation for coordination
- 🌍 **Multilingual** - English and Russian support
- 📱 **Telegram Integration** - Native Telegram Web App experience

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Vaul (Drawers), Lucide React (Icons)
- **Maps**: React Leaflet + OpenStreetMap
- **State**: Zustand
- **i18n**: next-intl
- **Animations**: Framer Motion

## 🚀 Быстрый старт

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Примените миграцию из `supabase/migrations/001_initial_schema.sql`
3. Скопируйте API ключи

### 3. Environment Variables

Создайте `.env.local`:

```env
# Telegram
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_FORUM_CHAT_ID=-100XXXXXXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Запустите сервер разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

📖 **Полная документация**: См. [`QUICKSTART.md`](./QUICKSTART.md) и [`DEPLOYMENT.md`](./DEPLOYMENT.md)

## Telegram Bot Setup

### Creating a Bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot` and follow instructions
3. Save your bot token to `.env.local`

### Configuring Web App

1. Send `/newapp` to BotFather
2. Select your bot
3. Provide app details:
   - **Title**: LOCALS
   - **Description**: Hyper-local tasks and events
   - **Photo**: Upload a 640x360px image
   - **Demo GIF**: (optional)
   - **Short name**: `locals` (lowercase, no spaces)
   - **Web App URL**: Your deployed URL (e.g., `https://your-domain.vercel.app`)

### Testing in Telegram

Open your bot and click "Open App" or use:
```
https://t.me/YOUR_BOT_NAME/locals
```

## Telegram Forum Groups Integration 🎯

### Архитектура: ОДНА супергруппа с топиками

Вместо создания отдельной группы для каждого события, используем **Telegram Forum Groups**:

**Как это работает:**
1. Создается ОДНА супергруппа-форум (например "LOCALS Almaty")
2. Для каждого события/задачи создается **топик** (ветка обсуждения)
3. Пользователи присоединяются к конкретному топику
4. Все события города в одном месте!

**Преимущества:**
- ✅ Не нужно создавать сотни групп
- ✅ Все события в одном форуме
- ✅ Легче модерировать
- ✅ Пользователи видят все активные события
- ✅ Telegram автоматически организует обсуждения

### Настройка

1. Создайте супергруппу в Telegram
2. Включите "Topics" в настройках
3. Добавьте бота администратором
4. Получите Chat ID группы
5. Обновите `.env.local`:

```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_FORUM_CHAT_ID=-100XXXXXXXXX
```

**Подробная инструкция:** См. `TELEGRAM_SETUP.md`

### Текущая реализация

✅ **Реализовано:**
- Создание топиков через Bot API (`createForumTopic`)
- Автоматическое открытие чата при присоединении к событию
- In-app чат с интерфейсом как в Telegram
- Кнопка "Открыть в Telegram" для перехода в топик

⏳ **В разработке:**
- Webhook для синхронизации сообщений Telegram ↔ App
- Автоматическое закрытие топиков после завершения события
- Модерация и статистика

### Структура форум-группы

```
📱 LOCALS Almaty
├── 🎉 Футбол на районе (Topic #1)
├── 📦 Помочь с переездом (Topic #2)
├── 🎉 Настольные игры (Topic #3)
└── ...
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components (SlideButton, etc.)
│   ├── Map.tsx
│   ├── BottomDock.tsx
│   ├── ItemDrawer.tsx
│   ├── CreateDrawer.tsx
│   ├── ChatListDrawer.tsx
│   └── ...
├── store/                 # Zustand stores
│   ├── useItemsStore.ts
│   ├── useChatStore.ts
│   └── useUserStore.ts
├── i18n/                  # Internationalization
├── messages/              # Translation files
└── types/                 # TypeScript types
```

## 📦 Deployment

### Vercel + Supabase (рекомендуется)

```bash
# 1. Commit и push
git add .
git commit -m "feat: production ready"
git push

# 2. Deploy на Vercel
# - Добавьте все Environment Variables
# - Deploy

# 3. Настройте Telegram Webhook
curl https://your-app.vercel.app/api/telegram/set-webhook
```

📖 **Полная инструкция**: [`DEPLOYMENT.md`](./DEPLOYMENT.md)

## Features Status

### ✅ Полностью реализовано

- [x] **Backend**: Supabase PostgreSQL с PostGIS
- [x] **API Routes**: Полный REST API для items, users, messages, responses, reviews
- [x] **Real-time**: Supabase Realtime подписки на изменения
- [x] **Telegram Integration**: Forum Groups с топиками
- [x] **Telegram Webhook**: Синхронизация сообщений Telegram ↔ App
- [x] **Карта**: Location detection, nearby items, фильтры
- [x] **CRUD**: Создание/обновление/удаление задач и событий
- [x] **Отклики**: Система откликов на задачи с принятием/отклонением
- [x] **Чаты**: In-app чаты с синхронизацией с Telegram
- [x] **Пользователи**: Автоматическая синхронизация с Telegram
- [x] **Репутация**: Система отзывов и рейтинга пользователей
- [x] **Мультиязычность**: English и Russian

### 🚧 В планах

- [ ] Платежная интеграция (Stripe/Payoneer)
- [ ] Push-уведомления через Telegram
- [ ] Модерация контента
- [ ] Аналитика и статистика
- [ ] Мобильные приложения (iOS/Android)

## Contributing

This is a Telegram Mini App built for the LOCALS platform.

## License

Proprietary