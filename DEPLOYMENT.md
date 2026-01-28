# 🚀 LOCALS - Полное руководство по деплою

## 📋 Содержание

1. [Настройка Supabase](#1-настройка-supabase)
2. [Настройка переменных окружения](#2-настройка-переменных-окружения)
3. [Деплой на Vercel](#3-деплой-на-vercel)
4. [Настройка Telegram Webhook](#4-настройка-telegram-webhook)
5. [Тестирование](#5-тестирование)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Настройка Supabase

### Шаг 1.1: Создайте проект Supabase

1. Перейдите на [https://supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Создайте новый проект:
   - **Name**: `locals-production`
   - **Database Password**: (сохраните пароль)
   - **Region**: Выберите ближайший регион (Europe для лучшей производительности)

### Шаг 1.2: Примените миграцию БД

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`
3. Вставьте в SQL Editor и нажмите **RUN**
4. Подождите завершения (может занять 10-30 секунд)

### Шаг 1.3: Получите API ключи

1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL**: `https://xxxxxxxxx.supabase.co`
   - **anon public key**: начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (другой ключ!)

⚠️ **ВАЖНО**: `service_role` ключ дает полный доступ к БД. Никогда не делитесь им и не коммитьте в Git!

---

## 2. Настройка переменных окружения

### Локальная разработка

Создайте файл `.env.local` в корне проекта:

```env
# Telegram Bot
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=8537468832:AAEe00birYJ3I-2JWKzwe43LCj0ViniPUuQ
TELEGRAM_FORUM_CHAT_ID=-1003836967887

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production (Vercel)

Эти переменные будут добавлены на Vercel Dashboard (см. Шаг 3).

---

## 3. Деплой на Vercel

### Шаг 3.1: Подготовка репозитория

```bash
# Убедитесь что .env.local в .gitignore
git add .
git commit -m "feat: добавлен полный backend с Supabase"
git push origin main
```

### Шаг 3.2: Создайте проект на Vercel

1. Перейдите на [https://vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. **Import Git Repository**:
   - Выберите ваш репозиторий `locals`
   - Framework Preset: **Next.js** (должно определиться автоматически)
   - Root Directory: `./` (по умолчанию)

### Шаг 3.3: Настройте Environment Variables

В разделе **Environment Variables** добавьте:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` | `8537468832:AAEe00birYJ3I-2JWKzwe43LCj0ViniPUuQ` | Production, Preview, Development |
| `TELEGRAM_FORUM_CHAT_ID` | `-1003836967887` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (service role) | Production, Preview, Development |

⚠️ **Важно**: Установите все переменные для **всех environments** (Production, Preview, Development)

### Шаг 3.4: Deploy

1. Нажмите **"Deploy"**
2. Подождите 2-5 минут
3. Скопируйте Production URL (например: `https://locals-xxx.vercel.app`)

---

## 4. Настройка Telegram Webhook

### Шаг 4.1: Обновите URL в BotFather

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/mybots`
3. Выберите ваш бот `@bblinkappbot`
4. **Bot Settings** → **Menu Button**
5. **Edit Web App URL**: вставьте ваш Vercel URL
6. Сохраните

### Шаг 4.2: Установите Webhook для сообщений

**Метод 1: Через API (рекомендуется)**

Откройте в браузере:

```
https://your-vercel-domain.vercel.app/api/telegram/set-webhook
```

Должен вернуть JSON с `"success": true`

**Метод 2: Через cURL**

```bash
curl -X POST "https://api.telegram.org/bot8537468832:AAEe00birYJ3I-2JWKzwe43LCj0ViniPUuQ/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-vercel-domain.vercel.app/api/telegram/webhook",
    "allowed_updates": ["message"],
    "drop_pending_updates": true
  }'
```

### Шаг 4.3: Проверьте Webhook

Откройте в браузере:

```
https://your-vercel-domain.vercel.app/api/telegram/set-webhook
```

В ответе должно быть:

```json
{
  "url": "https://your-vercel-domain.vercel.app/api/telegram/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0,
  "max_connections": 40
}
```

---

## 5. Тестирование

### 5.1: Тест создания пользователя

1. Откройте приложение в Telegram
2. Проверьте консоль браузера (DevTools)
3. Должно появиться: `"User synced with API"`

### 5.2: Тест создания задачи/события

1. Нажмите **➕** кнопку внизу
2. Выберите тип (Task или Event)
3. Заполните форму
4. Нажмите **Create**
5. Проверьте:
   - ✅ Маркер появился на карте
   - ✅ Топик создан в Telegram форум-группе
   - ✅ Данные сохранены в Supabase (проверьте Table Editor)

### 5.3: Тест чата и синхронизации

1. Откройте созданное событие
2. Нажмите **Join**
3. Откройте чат в приложении
4. Отправьте сообщение в приложении
5. Откройте топик в Telegram и отправьте сообщение
6. Проверьте:
   - ✅ Сообщения из приложения видны в Telegram
   - ✅ Сообщения из Telegram видны в приложении (real-time)

### 5.4: Тест откликов на задачу

1. Создайте задачу (Task)
2. Откройте задачу другим пользователем (используйте второй аккаунт или браузер)
3. Нажмите **I can help**
4. Проверьте:
   - ✅ Отклик появился у автора задачи
   - ✅ Автор может принять/отклонить отклик
   - ✅ При принятии статус задачи меняется на IN_PROGRESS

---

## 6. Troubleshooting

### Ошибка: "Failed to fetch items"

**Причина**: Supabase URL или ключи неверны

**Решение**:
1. Проверьте переменные окружения в Vercel
2. Перезапустите деплой: **Deployments** → **...** → **Redeploy**

### Ошибка: "User not found"

**Причина**: Пользователь не синхронизирован с API

**Решение**:
1. Откройте DevTools → Console
2. Проверьте ошибки при инициализации
3. Убедитесь что `syncUserWithAPI` вызывается

### Ошибка: "Bot token not configured"

**Причина**: TELEGRAM_BOT_TOKEN не установлен

**Решение**:
1. Проверьте `.env.local` локально
2. Проверьте Environment Variables на Vercel
3. **Important**: Имя должно быть точно `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`

### Webhook не работает

**Причина**: Webhook URL неверный или не установлен

**Решение**:
1. Проверьте webhook: `GET /api/telegram/set-webhook`
2. Убедитесь что URL правильный (с https://)
3. Проверьте логи в Vercel: **Deployments** → **Functions**
4. Тестовое сообщение в Telegram топик должно появиться в логах

### "PGRST116" ошибка (Item not found)

**Причина**: Item не существует или был удален

**Решение**:
1. Проверьте Table Editor в Supabase
2. Убедитесь что `id` правильный (UUID формат)

### Real-time не работает

**Причина**: Supabase Realtime не включен для таблиц

**Решение**:
1. Supabase Dashboard → **Database** → **Replication**
2. Включите replication для таблиц: `items`, `messages`, `responses`
3. **Source** должно быть включено для всех таблиц

---

## 📊 Мониторинг

### Vercel Analytics

1. **Deployments** → выберите deployment → **Functions**
2. Смотрите логи API routes
3. Проверяйте время выполнения (должно быть < 1s)

### Supabase Logs

1. **Logs** → **API Logs**
2. Фильтруйте по статусу (errors 500)
3. Смотрите slow queries (> 500ms)

### Telegram Bot Logs

1. Проверяйте webhook updates: `GET /api/telegram/set-webhook`
2. `pending_update_count` должен быть 0

---

## 🎉 Готово!

Ваше приложение **LOCALS** полностью развернуто и работает!

**Production URL**: `https://your-domain.vercel.app`
**Telegram Bot**: [@bblinkappbot](https://t.me/bblinkappbot)
**Forum Group**: [BLINK](https://t.me/blinkappchat)

---

## 📝 Дополнительные ресурсы

- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel
2. Проверьте Table Editor в Supabase
3. Проверьте DevTools Console в браузере
4. Проверьте Telegram Bot webhook status
