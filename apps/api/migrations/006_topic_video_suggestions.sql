-- Topic-scoped video suggestions: cache and serve only course-related topics.
-- Topics are derived from user roadmaps (subject, module names, module topics).

CREATE TABLE IF NOT EXISTS topic_video_suggestions (
  id SERIAL PRIMARY KEY,
  topic_normalized VARCHAR(255) NOT NULL,
  external_id VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  content_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  channel_title VARCHAR(255),
  source VARCHAR(50) NOT NULL DEFAULT 'youtube',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (topic_normalized, external_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_video_suggestions_topic ON topic_video_suggestions(topic_normalized);
CREATE INDEX IF NOT EXISTS idx_topic_video_suggestions_created ON topic_video_suggestions(topic_normalized, created_at DESC);

COMMENT ON TABLE topic_video_suggestions IS 'Cached video suggestions per course topic; only topic-related videos are stored.';
