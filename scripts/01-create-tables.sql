-- Avatar Productivity App Database Schema
-- Based on PRD requirements for Basecamp integration and gamification

-- Projects table (synced from Basecamp)
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  basecamp_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo Lists table (synced from Basecamp)
CREATE TABLE IF NOT EXISTS todo_lists (
  id BIGSERIAL PRIMARY KEY,
  basecamp_id BIGINT UNIQUE,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todos table (synced from Basecamp)
CREATE TABLE IF NOT EXISTS todos (
  id BIGSERIAL PRIMARY KEY,
  basecamp_id BIGINT UNIQUE,
  todo_list_id BIGINT REFERENCES todo_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  assignee_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Sync state tracking
CREATE TABLE IF NOT EXISTS sync_state (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'projects', 'todo_lists', 'todos'
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'error'
  error_message TEXT
);

-- XP and gamification log
CREATE TABLE IF NOT EXISTS xp_log (
  id BIGSERIAL PRIMARY KEY,
  action_type TEXT NOT NULL, -- 'task_completed', 'focus_session', 'daily_login', 'streak_bonus'
  xp_earned INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  metadata JSONB, -- Store additional data like task_id, session_duration, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User stats for gamification
CREATE TABLE IF NOT EXISTS user_stats (
  id BIGSERIAL PRIMARY KEY,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  tasks_completed_today INTEGER DEFAULT 0,
  focus_minutes_today INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial sync state records
INSERT INTO sync_state (entity_type, sync_status) VALUES 
  ('projects', 'pending'),
  ('todo_lists', 'pending'),
  ('todos', 'pending')
ON CONFLICT DO NOTHING;

-- Insert initial user stats
INSERT INTO user_stats (total_xp, current_level) VALUES (0, 1)
ON CONFLICT DO NOTHING;
