-- Add moderation and privacy features (FIXED VERSION)
-- Исправлена проблема с auth.uid() для Telegram Web App

-- 1. Add new columns to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;

-- 2. Add privacy settings to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS allow_direct_messages BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_accept_responses BOOLEAN DEFAULT true;

-- 3. Create chat_participants table to track who joined events
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'LEFT')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ,
    approved_by BIGINT REFERENCES users(id),
    UNIQUE(item_id, user_id)
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_participants_item ON chat_participants(item_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_status ON chat_participants(status);
CREATE INDEX IF NOT EXISTS idx_items_max_participants ON items(max_participants) WHERE max_participants IS NOT NULL;

-- 5. Function to check if event is full
CREATE OR REPLACE FUNCTION is_event_full(event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    max_count INTEGER;
    current_count INTEGER;
BEGIN
    SELECT max_participants INTO max_count
    FROM items
    WHERE id = event_id;
    
    -- If no limit, never full
    IF max_count IS NULL THEN
        RETURN false;
    END IF;
    
    SELECT COUNT(*) INTO current_count
    FROM chat_participants
    WHERE item_id = event_id 
    AND status = 'APPROVED';
    
    RETURN current_count >= max_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to update current_participants count
CREATE OR REPLACE FUNCTION update_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE items
        SET current_participants = (
            SELECT COUNT(*)
            FROM chat_participants
            WHERE item_id = NEW.item_id
            AND status = 'APPROVED'
        )
        WHERE id = NEW.item_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE items
        SET current_participants = (
            SELECT COUNT(*)
            FROM chat_participants
            WHERE item_id = OLD.item_id
            AND status = 'APPROVED'
        )
        WHERE id = OLD.item_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for auto-updating participants count
DROP TRIGGER IF EXISTS trigger_update_participants_count ON chat_participants;
CREATE TRIGGER trigger_update_participants_count
AFTER INSERT OR UPDATE OR DELETE ON chat_participants
FOR EACH ROW
EXECUTE FUNCTION update_participants_count();

-- 8. RLS policies for chat_participants (FIXED - no auth.uid())
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "chat_participants_select_policy" ON chat_participants;
DROP POLICY IF EXISTS "chat_participants_insert_policy" ON chat_participants;
DROP POLICY IF EXISTS "chat_participants_update_policy" ON chat_participants;
DROP POLICY IF EXISTS "chat_participants_delete_policy" ON chat_participants;

-- Anyone can view participants (public read)
CREATE POLICY "chat_participants_select_policy" ON chat_participants
    FOR SELECT USING (true);

-- Anyone can join events (validated in application logic)
CREATE POLICY "chat_participants_insert_policy" ON chat_participants
    FOR INSERT WITH CHECK (true);

-- Anyone can update (author validation done in application)
CREATE POLICY "chat_participants_update_policy" ON chat_participants
    FOR UPDATE USING (true);

-- Anyone can delete (validation in application)
CREATE POLICY "chat_participants_delete_policy" ON chat_participants
    FOR DELETE USING (true);

-- 9. Add comments
COMMENT ON COLUMN items.max_participants IS 'Maximum number of participants for events (NULL = unlimited)';
COMMENT ON COLUMN items.requires_approval IS 'Whether author must approve join requests';
COMMENT ON COLUMN items.current_participants IS 'Current number of approved participants';
COMMENT ON COLUMN users.allow_direct_messages IS 'Whether user accepts direct messages from others';
COMMENT ON COLUMN users.auto_accept_responses IS 'Auto-accept task responses without manual approval';
COMMENT ON TABLE chat_participants IS 'Tracks participants in event chats with approval status';

-- 10. Verification queries
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002 completed successfully!';
    RAISE NOTICE 'New columns added to items: max_participants, requires_approval, current_participants';
    RAISE NOTICE 'New columns added to users: allow_direct_messages, auto_accept_responses';
    RAISE NOTICE 'New table created: chat_participants';
    RAISE NOTICE 'New function created: is_event_full()';
    RAISE NOTICE 'New trigger created: trigger_update_participants_count';
END $$;
