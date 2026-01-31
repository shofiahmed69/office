-- Save assessment weak points and concepts tested
ALTER TABLE user_skill_assessments
ADD COLUMN IF NOT EXISTS weak_points JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS concepts_tested JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN user_skill_assessments.weak_points IS 'Topic names where user scored below threshold (e.g. 70%)';
COMMENT ON COLUMN user_skill_assessments.concepts_tested IS 'List of concepts/topics that appeared in this assessment';
