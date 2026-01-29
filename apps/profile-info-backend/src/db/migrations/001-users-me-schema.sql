-- Ensure trigger function exists (in case migration runs without full schema)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add new columns to profiles (users) for /api/users/me spec
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS master_hub_id INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS master_country_id INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_role VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state VARCHAR(255);

-- User roles (one row per role per user)
CREATE TABLE IF NOT EXISTS user_roles (
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_profile_id ON user_roles(profile_id);

-- User permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, permission)
);
CREATE INDEX IF NOT EXISTS idx_user_permissions_profile_id ON user_permissions(profile_id);

-- profile_tags: add tag_value, rating_score, source_type for user tags spec
ALTER TABLE profile_tags ADD COLUMN IF NOT EXISTS tag_value VARCHAR(255);
ALTER TABLE profile_tags ADD COLUMN IF NOT EXISTS rating_score INTEGER;
ALTER TABLE profile_tags ADD COLUMN IF NOT EXISTS source_type VARCHAR(64) DEFAULT 'manual';

-- AI provider settings per user
CREATE TABLE IF NOT EXISTS user_ai_settings (
  id SERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_name VARCHAR(255) NOT NULL,
  api_key_encrypted TEXT,
  model VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_ai_settings_profile_id ON user_ai_settings(profile_id);

DROP TRIGGER IF EXISTS user_ai_settings_updated_at ON user_ai_settings;
CREATE TRIGGER user_ai_settings_updated_at
  BEFORE UPDATE ON user_ai_settings
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
