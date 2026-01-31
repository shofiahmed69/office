-- Link generated video content to roadmap modules (for personalized course generation)
CREATE TABLE IF NOT EXISTS roadmap_content (
  id SERIAL PRIMARY KEY,
  roadmap_id INTEGER NOT NULL REFERENCES user_learning_roadmaps(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (roadmap_id, content_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_content_roadmap ON roadmap_content(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_content_module ON roadmap_content(roadmap_id, module_id);

-- Ensure content_sources has YouTube (idempotent)
INSERT INTO content_sources (name, type, base_url, is_active)
VALUES ('YouTube', 'youtube', 'https://www.youtube.com', true)
ON CONFLICT DO NOTHING;
