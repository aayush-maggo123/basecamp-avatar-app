-- Add tasks_completed_total column to user_stats table
ALTER TABLE user_stats 
ADD COLUMN IF NOT EXISTS tasks_completed_total INTEGER DEFAULT 0;

-- Update the existing record with current completed task count
UPDATE user_stats 
SET tasks_completed_total = (
  SELECT COUNT(*) 
  FROM todos 
  WHERE completed = true 
    AND assignee_id = 47103552
)
WHERE id = 1;