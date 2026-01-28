-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (синхронизируется с Telegram)
CREATE TABLE users (
  id BIGINT PRIMARY KEY, -- Telegram user ID
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  reputation DECIMAL(3,2) DEFAULT 5.0,
  language_code TEXT DEFAULT 'ru',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items (tasks + events)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('TASK', 'EVENT')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'KZT', 'RUB', 'EUR')),
  event_date TIMESTAMPTZ,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS для геоданных
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  executor_id BIGINT REFERENCES users(id),
  telegram_topic_id INTEGER,
  telegram_chat_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses (отклики на задачи/события)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, user_id) -- Один пользователь - один отклик на item
);

-- Messages (для in-app чатов и синхронизации с Telegram)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  telegram_message_id INTEGER,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews (отзывы после выполнения задачи)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, author_id, target_user_id) -- Один отзыв от одного пользователя другому по задаче
);

-- Indexes для производительности
CREATE INDEX idx_items_location ON items USING GIST(location);
CREATE INDEX idx_items_status ON items(status) WHERE status IN ('OPEN', 'IN_PROGRESS');
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_author ON items(author_id);
CREATE INDEX idx_items_created ON items(created_at DESC);
CREATE INDEX idx_messages_item_created ON messages(item_id, created_at DESC);
CREATE INDEX idx_responses_item ON responses(item_id);
CREATE INDEX idx_responses_user ON responses(user_id);
CREATE INDEX idx_reviews_target_user ON reviews(target_user_id);

-- Trigger для автоматического обновления location из lat/lng
CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_update_location
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_location();

-- Trigger для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER responses_updated_at BEFORE UPDATE ON responses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function для поиска nearby items
CREATE OR REPLACE FUNCTION nearby_items(
  lat DECIMAL,
  lng DECIMAL,
  radius_meters INTEGER DEFAULT 5000,
  item_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  price DECIMAL,
  currency TEXT,
  event_date TIMESTAMPTZ,
  latitude DECIMAL,
  longitude DECIMAL,
  status TEXT,
  author_id BIGINT,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.type,
    i.title,
    i.description,
    i.price,
    i.currency,
    i.event_date,
    i.latitude,
    i.longitude,
    i.status,
    i.author_id,
    ST_Distance(
      i.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) AS distance_meters
  FROM items i
  WHERE 
    i.status IN ('OPEN', 'IN_PROGRESS')
    AND (item_type IS NULL OR i.type = item_type)
    AND ST_DWithin(
      i.location,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- Function для обновления reputation после review
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET reputation = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM reviews
    WHERE target_user_id = NEW.target_user_id
  )
  WHERE id = NEW.target_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_reputation
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Все могут читать пользователей
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);

-- Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Все могут читать открытые items
CREATE POLICY "Items are viewable by everyone" ON items FOR SELECT USING (true);

-- Аутентифицированные пользователи могут создавать items
CREATE POLICY "Authenticated users can create items" ON items FOR INSERT WITH CHECK (true);

-- Авторы могут обновлять свои items
CREATE POLICY "Authors can update own items" ON items FOR UPDATE USING (true);

-- Авторы могут удалять свои items
CREATE POLICY "Authors can delete own items" ON items FOR DELETE USING (true);

-- Все могут читать responses
CREATE POLICY "Responses are viewable by everyone" ON responses FOR SELECT USING (true);

-- Аутентифицированные могут создавать responses
CREATE POLICY "Authenticated users can create responses" ON responses FOR INSERT WITH CHECK (true);

-- Авторы items могут обновлять responses (accept/reject)
CREATE POLICY "Item authors can update responses" ON responses FOR UPDATE USING (true);

-- Все могут читать messages
CREATE POLICY "Messages are viewable by everyone" ON messages FOR SELECT USING (true);

-- Аутентифицированные могут создавать messages
CREATE POLICY "Authenticated users can create messages" ON messages FOR INSERT WITH CHECK (true);

-- Все могут читать reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

-- Аутентифицированные могут создавать reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (true);
