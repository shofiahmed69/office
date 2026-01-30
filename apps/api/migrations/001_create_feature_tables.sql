-- ScholarPass Feature Tables Migration
-- Run this SQL on your PostgreSQL database to enable all features

-- ============================================
-- User Tags (for skills and interests)
-- ============================================
CREATE TABLE IF NOT EXISTS app_user_tags (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  tag_name VARCHAR(255) NOT NULL,
  tag_value TEXT,
  master_tag_id INTEGER,
  master_tag_group_id INTEGER,
  master_tag_category_id INTEGER,
  tag_group_name VARCHAR(128),
  tag_category_name VARCHAR(128),
  display_sequence INTEGER,
  rating_score INTEGER CHECK (rating_score >= 1 AND rating_score <= 10),
  is_filled BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_tag BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by_user_id INTEGER,
  ai_suggested BOOLEAN NOT NULL DEFAULT FALSE,
  ai_confidence_score NUMERIC(3,2),
  ai_suggestion_date TIMESTAMP,
  user_accepted_ai BOOLEAN,
  source_type VARCHAR(50) DEFAULT 'manual',
  created_by_user_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tags_user ON app_user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_filled ON app_user_tags(user_id, is_filled);

-- ============================================
-- Skill Assessments
-- ============================================
CREATE TABLE IF NOT EXISTS user_skill_assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  skill_scores JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user ON user_skill_assessments(user_id);

-- ============================================
-- Learning Roadmaps
-- ============================================
CREATE TABLE IF NOT EXISTS user_learning_roadmaps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  learning_goal TEXT NOT NULL,
  skill_gaps JSONB NOT NULL DEFAULT '{}',
  roadmap_data JSONB NOT NULL DEFAULT '{}',
  hours_per_week INTEGER NOT NULL,
  estimated_weeks INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  progress_percentage NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON user_learning_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON user_learning_roadmaps(status);

CREATE TABLE IF NOT EXISTS roadmap_modules (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER NOT NULL REFERENCES user_learning_roadmaps(id) ON DELETE CASCADE,
  module_name VARCHAR(255) NOT NULL,
  module_description TEXT,
  topics JSONB NOT NULL,
  estimated_hours INTEGER NOT NULL,
  sequence_order INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_roadmap ON roadmap_modules(roadmap_id);

-- ============================================
-- Content Sources and Educational Content
-- ============================================
CREATE TABLE IF NOT EXISTS content_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  base_url TEXT NOT NULL,
  api_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_crawled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS educational_content (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES content_sources(id),
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  difficulty_level VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',
  transcript TEXT,
  topics JSONB,
  quality_score NUMERIC(3,2) DEFAULT 0.00,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_content_topics ON educational_content USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_content_search ON educational_content USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

CREATE TABLE IF NOT EXISTS user_content_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES educational_content(id),
  watch_time_seconds INTEGER DEFAULT 0,
  total_duration INTEGER NOT NULL,
  last_position INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON user_content_progress(user_id);

-- ============================================
-- Study Buddy System
-- ============================================
CREATE TABLE IF NOT EXISTS study_buddy_matches (
  id SERIAL PRIMARY KEY,
  requester_user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  requested_user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL,
  match_reason TEXT,
  personal_message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE (requester_user_id, requested_user_id)
);

CREATE TABLE IF NOT EXISTS study_buddies (
  id SERIAL PRIMARY KEY,
  user_id_1 INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  user_id_2 INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  connected_at TIMESTAMP DEFAULT NOW(),
  total_sessions INTEGER DEFAULT 0,
  last_session_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (user_id_1, user_id_2)
);

CREATE TABLE IF NOT EXISTS buddy_assignments (
  id SERIAL PRIMARY KEY,
  buddy_id INTEGER NOT NULL REFERENCES study_buddies(id) ON DELETE CASCADE,
  roadmap_id INTEGER REFERENCES user_learning_roadmaps(id),
  module_id INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_study_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  available_times JSONB,
  timezone VARCHAR(50),
  preferred_subjects JSONB,
  skill_levels JSONB,
  learning_style VARCHAR(50),
  study_pace VARCHAR(50),
  collaboration_pref VARCHAR(50),
  max_study_buddies INTEGER DEFAULT 5,
  is_findable BOOLEAN DEFAULT TRUE,
  is_ai_listening_opt_in BOOLEAN DEFAULT FALSE,
  is_recording_opt_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Study Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  session_name VARCHAR(255),
  session_description TEXT,
  host_user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  study_buddy_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
  video_call_type VARCHAR(50) DEFAULT 'webrtc',
  video_call_room_id VARCHAR(255) NOT NULL,
  video_call_url TEXT,
  video_call_meeting_id VARCHAR(255),
  is_ai_listening_enabled BOOLEAN DEFAULT FALSE,
  is_recording_enabled BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'scheduled',
  scheduled_start_time TIMESTAMP,
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  duration_minutes INTEGER,
  study_topics JSONB,
  learning_goals JSONB,
  shared_resources JSONB,
  ai_transcript TEXT,
  ai_summary TEXT,
  ai_key_insights JSONB,
  ai_action_items JSONB,
  ai_questions_answered JSONB,
  engagement_score NUMERIC(5,2),
  topics_covered JSONB,
  knowledge_gaps_identified JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_host ON study_sessions(host_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_buddy ON study_sessions(study_buddy_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON study_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON study_sessions(scheduled_start_time);

-- ============================================
-- Transcription and AI Assistance
-- ============================================
CREATE TABLE IF NOT EXISTS study_session_transcription_chunks (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  speaker_user_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
  transcript_text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  sequence_number INTEGER NOT NULL,
  confidence_score NUMERIC(3,2),
  language_detected VARCHAR(10),
  duration_seconds NUMERIC(5,2)
);

CREATE INDEX IF NOT EXISTS idx_transcription_session_seq 
  ON study_session_transcription_chunks(session_id, sequence_number);

CREATE TABLE IF NOT EXISTS study_session_ai_assistance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  ai_response_text TEXT NOT NULL,
  context_used JSONB,
  response_confidence NUMERIC(3,2),
  was_helpful BOOLEAN,
  asked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistance_session ON study_session_ai_assistance(session_id);

-- ============================================
-- Analytics and Attention Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS attention_tracking_data (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  focus_percentage NUMERIC(5,2) NOT NULL,
  total_samples INTEGER NOT NULL,
  focused_samples INTEGER NOT NULL,
  distraction_events INTEGER DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attention_session ON attention_tracking_data(session_id);
CREATE INDEX IF NOT EXISTS idx_attention_user ON attention_tracking_data(user_id);

-- ============================================
-- Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS app_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_by_user_id INTEGER REFERENCES app_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON app_notifications(user_id, is_read);

-- ============================================
-- Admin Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_user_id INTEGER NOT NULL REFERENCES app_users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at);

-- ============================================
-- Insert sample content source
-- ============================================
INSERT INTO content_sources (name, type, base_url, is_active)
VALUES ('YouTube', 'youtube', 'https://www.youtube.com', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Done!
-- ============================================
SELECT 'Migration completed successfully!' AS status;
