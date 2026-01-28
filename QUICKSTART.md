# ⚡ LOCALS - Быстрый старт (5 минут)

Полностью рабочий MVP за 5 минут!

## 🎯 Шаг 1: Supabase (2 минуты)

1. Перейдите на [supabase.com](https://supabase.com) → **New Project**
2. Создайте проект (сохраните пароль!)
3. Откройте **SQL Editor** → вставьте содержимое `supabase/migrations/001_initial_schema.sql` → **RUN**
4. **Settings** → **API** → скопируйте:
   - Project URL
   - anon public key
   - service_role key

## 🎯 Шаг 2: Environment Variables (1 минута)

Создайте `.env.local`:

```env
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=8537468832:AAEe00birYJ3I-2JWKzwe43LCj0ViniPUuQ
TELEGRAM_FORUM_CHAT_ID=-1003836967887
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## 🎯 Шаг 3: Локальный запуск (30 секунд)

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🎯 Шаг 4: Deploy на Vercel (1 минута)

```bash
git add .
git commit -m "feat: полный backend с Supabase"
git push
```

1. [vercel.com](https://vercel.com) → **New Project**
2. Import your repo
3. Добавьте все Environment Variables из `.env.local`
4. **Deploy**

## 🎯 Шаг 5: Webhook (30 секунд)

После деплоя откройте в браузере:

```
https://your-app.vercel.app/api/telegram/set-webhook
```

Должен вернуть `"success": true`

## ✅ Готово!

Откройте [@bblinkappbot](https://t.me/bblinkappbot) и протестируйте!

---

## 🧪 Что тестировать

1. ✅ Создайте событие → проверьте что появился топик в Telegram
2. ✅ Отправьте сообщение в топик → проверьте что появилось в приложении
3. ✅ Создайте задачу → откликнитесь → примите отклик
4. ✅ Завершите задачу → оставьте отзыв

---

## 🆘 Проблемы?

- **"Failed to fetch items"**: Проверьте Supabase URL и ключи
- **"Bot token not configured"**: Проверьте NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
- **Webhook не работает**: Проверьте `GET /api/telegram/set-webhook`
- **Real-time не работает**: Включите Replication в Supabase для таблиц

Подробнее: см. `DEPLOYMENT.md`
