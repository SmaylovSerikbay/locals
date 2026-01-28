# 🚀 Детальная Инструкция: Применение Миграции 002

## ❗ Что исправлено
Исправлена ошибка **"operator does not exist: bigint = uuid"** - убраны некорректные RLS policies с `auth.uid()`.

---

## 📋 Пошаговая Инструкция

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите на [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Войдите в свой аккаунт
3. Выберите проект **LOCALS** (или ваш проект)

![Supabase Dashboard](https://supabase.com/docs/img/supabase-dashboard.png)

---

### Шаг 2: Откройте SQL Editor

1. В левом боковом меню найдите раздел **"SQL Editor"**
2. Кликните на **"SQL Editor"**
3. Вы увидите редактор SQL запросов

![SQL Editor](https://supabase.com/docs/img/sql-editor.png)

---

### Шаг 3: Создайте Новый Query

1. Нажмите кнопку **"New query"** в верхнем правом углу
2. Появится пустой редактор с названием "Untitled Query"
3. Можете переименовать запрос (например, "Migration 002")

![New Query](https://supabase.com/docs/img/new-query.png)

---

### Шаг 4: Скопируйте SQL Скрипт

**ВАЖНО:** Используйте **исправленный** файл!

#### ✅ Правильный файл:
```
supabase/migrations/002_add_moderation_features_FIXED.sql
```

#### ❌ НЕ используйте старый файл:
```
supabase/migrations/002_add_moderation_features.sql
```

---

### Шаг 5: Вставьте SQL Код

1. Откройте файл `002_add_moderation_features_FIXED.sql` в вашем редакторе
2. Выделите **весь** текст (Ctrl/Cmd + A)
3. Скопируйте (Ctrl/Cmd + C)
4. Вернитесь в Supabase SQL Editor
5. Вставьте в редактор (Ctrl/Cmd + V)

**Должно выглядеть примерно так:**
```sql
-- Add moderation and privacy features (FIXED VERSION)
-- Исправлена проблема с auth.uid() для Telegram Web App

-- 1. Add new columns to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
...
```

---

### Шаг 6: Выполните SQL Скрипт

#### Способ 1: Кнопка Run
1. Нажмите зеленую кнопку **"Run"** в правом нижнем углу
2. Или нажмите **Ctrl + Enter** (Windows/Linux) или **Cmd + Enter** (Mac)

#### Что должно произойти:
- В нижней части экрана появится панель "Results"
- Если успешно, вы увидите:
  ```
  ✅ Success. No rows returned
  ```
- Также должны появиться сообщения (NOTICES):
  ```
  NOTICE: ✅ Migration 002 completed successfully!
  NOTICE: New columns added to items: max_participants, requires_approval, current_participants
  NOTICE: New columns added to users: allow_direct_messages, auto_accept_responses
  NOTICE: New table created: chat_participants
  NOTICE: New function created: is_event_full()
  NOTICE: New trigger created: trigger_update_participants_count
  ```

![Run Query](https://supabase.com/docs/img/run-query.png)

---

### Шаг 7: Проверьте Результат

Создайте **еще один новый query** и выполните следующие проверочные запросы:

#### 7.1 Проверка новых колонок в items
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'items' 
AND column_name IN ('max_participants', 'requires_approval', 'current_participants')
ORDER BY column_name;
```

**Ожидаемый результат:**
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| current_participants | integer | YES | 0 |
| max_participants | integer | YES | NULL |
| requires_approval | boolean | YES | false |

---

#### 7.2 Проверка новых колонок в users
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('allow_direct_messages', 'auto_accept_responses')
ORDER BY column_name;
```

**Ожидаемый результат:**
| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| allow_direct_messages | boolean | YES | true |
| auto_accept_responses | boolean | YES | true |

---

#### 7.3 Проверка таблицы chat_participants
```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chat_participants'
ORDER BY ordinal_position;
```

**Ожидаемый результат:**
Должна показаться таблица с колонками:
- id (uuid)
- item_id (uuid)
- user_id (bigint)
- status (text)
- joined_at (timestamptz)
- approved_at (timestamptz)
- approved_by (bigint)

---

#### 7.4 Проверка функций
```sql
SELECT 
    routine_name, 
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('is_event_full', 'update_participants_count');
```

**Ожидаемый результат:**
| routine_name | routine_type | return_type |
|-------------|-------------|-------------|
| is_event_full | FUNCTION | boolean |
| update_participants_count | FUNCTION | trigger |

---

#### 7.5 Проверка триггера
```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_participants_count';
```

**Ожидаемый результат:**
| trigger_name | event_manipulation | event_object_table |
|-------------|-------------------|-------------------|
| trigger_update_participants_count | INSERT | chat_participants |
| trigger_update_participants_count | UPDATE | chat_participants |
| trigger_update_participants_count | DELETE | chat_participants |

---

### Шаг 8: Финальная Проверка

Выполните этот запрос чтобы убедиться что всё работает:

```sql
-- Проверка функции is_event_full
SELECT is_event_full('00000000-0000-0000-0000-000000000000'::uuid) as is_full;
```

**Ожидаемый результат:**
```
is_full: false
```

Если функция вернула `false` - всё отлично! ✅

---

## 🎉 Готово!

Миграция успешно применена! Теперь у вас есть:

✅ Лимит участников для Events  
✅ Модерация вступления  
✅ Таблица для отслеживания участников  
✅ Автоматический счетчик участников  
✅ Настройки приватности для пользователей  

---

## ❌ Что Делать При Ошибках

### Ошибка 1: "relation already exists"
**Причина:** Миграция уже была частично применена  
**Решение:** Это нормально! Скрипт использует `IF NOT EXISTS`, так что просто продолжайте

---

### Ошибка 2: "column already exists"
**Причина:** Колонки уже добавлены  
**Решение:** Всё ОК! Скрипт использует `ADD COLUMN IF NOT EXISTS`

---

### Ошибка 3: "permission denied"
**Причина:** Недостаточно прав  
**Решение:** 
1. Убедитесь что вы Owner проекта
2. Попробуйте выйти и зайти заново в Supabase
3. Проверьте что вы выбрали правильный проект

---

### Ошибка 4: "syntax error near..."
**Причина:** Скопировался не весь SQL код  
**Решение:**
1. Удалите всё из SQL Editor
2. Снова скопируйте **весь** файл `002_add_moderation_features_FIXED.sql`
3. Вставьте заново
4. Убедитесь что последняя строка это `END $$;`

---

## 📝 Следующие Шаги

После успешного применения миграции:

1. ✅ Перезапустите dev сервер: `pnpm run dev`
2. ✅ Создайте тестовый Event с лимитом участников
3. ✅ Проверьте что топики Telegram создаются
4. ✅ Протестируйте модерацию вступления

---

## 🆘 Нужна Помощь?

Если что-то не работает:
1. Скопируйте **полный текст ошибки**
2. Сделайте скриншот SQL Editor
3. Покажите мне - я помогу!

---

## 📚 Дополнительная Информация

Подробное описание всех новых фич:
- `MODERATION_FEATURES.md` - API endpoints, примеры использования

Исходный файл миграции:
- ✅ `supabase/migrations/002_add_moderation_features_FIXED.sql` - используйте этот!
- ❌ `supabase/migrations/002_add_moderation_features.sql` - старый, не используйте
