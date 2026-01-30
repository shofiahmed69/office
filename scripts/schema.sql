-- Optional: run this if your scholarpass DB doesn't have these tables/columns yet.
-- Adjust table and column names to match your existing schema if different.

-- Users (ensure locked, lock_reason exist)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_reason TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Audit logs
-- CREATE TABLE IF NOT EXISTS audit_logs (
--   id SERIAL PRIMARY KEY,
--   action VARCHAR(100) NOT NULL,
--   actor_user_id INTEGER,
--   metadata JSONB,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Prompts
-- CREATE TABLE IF NOT EXISTS prompts (
--   id SERIAL PRIMARY KEY,
--   title VARCHAR(255),
--   category VARCHAR(100),
--   prompt_template TEXT,
--   is_published BOOLEAN DEFAULT false,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
