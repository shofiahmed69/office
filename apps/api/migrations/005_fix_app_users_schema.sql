-- Fix app_users schema by adding missing columns required by auth service and types

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS active_or_archive BOOLEAN DEFAULT TRUE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS account_lock BOOLEAN DEFAULT FALSE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS access_failed_count INTEGER DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Ensure primary_role_id exists (it might be missing if the table was very basic)
-- We won't force FK constraint here just in case, but usually it should be.
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS primary_role_id INTEGER DEFAULT 3; 

-- Update existing NULL values to defaults to avoid issues
UPDATE app_users SET active_or_archive = TRUE WHERE active_or_archive IS NULL;
UPDATE app_users SET account_lock = FALSE WHERE account_lock IS NULL;
UPDATE app_users SET access_failed_count = 0 WHERE access_failed_count IS NULL;
