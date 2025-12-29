-- Enable extensions for full-text search and UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for full-text search (will be applied after tables are created via Drizzle migrations)
-- These are placeholder comments for reference:
-- CREATE INDEX idx_conversations_title_trgm ON conversations USING gin (title gin_trgm_ops);
-- CREATE INDEX idx_messages_content_trgm ON messages USING gin (content gin_trgm_ops);
