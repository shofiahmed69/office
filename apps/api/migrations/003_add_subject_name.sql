-- Add subject_name column to user_skill_assessments
ALTER TABLE user_skill_assessments 
ADD COLUMN IF NOT EXISTS subject_name VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON user_skill_assessments(subject_name);
