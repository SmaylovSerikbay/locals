-- Add moderation and privacy features

-- 1. Add new columns to items table
ALTER TABLE items 
ADD COLUMN max_participants INTEGER,
ADD COLUMN requires_approval BOOLEAN DEFAULT false,
ADD COLUMN current_participants INTEGER DEFAULT 0;

-- 2. Add privacy settings to users table
ALTER TABLE users 
ADD COLUMN allow_direct_messages BOOLEAN DEFAULT true,
ADD COLUMN auto_accept_responses BOOLEAN DEFAULT true;

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
CREATE INDEX idx_chat_participants_item ON chat_participants(item_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_status ON chat_participants(status);
CREATE INDEX idx_items_max_participants ON items(max_participants) WHERE max_participants IS NOT NULL;

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
CREATE TRIGGER trigger_update_participants_count
AFTER INSERT OR UPDATE OR DELETE ON chat_participants
FOR EACH ROW
EXECUTE FUNCTION update_participants_count();

-- 8. RLS policies for chat_participants
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can view participants
CREATE POLICY "chat_participants_select_policy" ON chat_participants
    FOR SELECT USING (true);

-- Users can join events
CREATE POLICY "chat_participants_insert_policy" ON chat_participants
    FOR INSERT WITH CHECK (true);

-- Item author can update (approve/reject)
CREATE POLICY "chat_participants_update_policy" ON chat_participants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM items
            WHERE items.id = chat_participants.item_id
            AND items.author_id = auth.uid()
        )
    );

-- Users can delete their own participation
CREATE POLICY "chat_participants_delete_policy" ON chat_participants
    FOR DELETE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM items
            WHERE items.id = chat_participants.item_id
            AND items.author_id = auth.uid()
        )
    );

-- 9. Add comments
COMMENT ON COLUMN items.max_participants IS 'Maximum number of participants for events (NULL = unlimited)';
COMMENT ON COLUMN items.requires_approval IS 'Whether author must approve join requests';
COMMENT ON COLUMN items.current_participants IS 'Current number of approved participants';
COMMENT ON COLUMN users.allow_direct_messages IS 'Whether user accepts direct messages from others';
COMMENT ON COLUMN users.auto_accept_responses IS 'Auto-accept task responses without manual approval';
COMMENT ON TABLE chat_participants IS 'Tracks participants in event chats with approval status';
