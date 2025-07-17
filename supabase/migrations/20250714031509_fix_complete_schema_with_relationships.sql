-- ============================================================================= 
-- EFFECTO TASKFLOW - COMPLETE DATABASE SCHEMA WITH RELATIONSHIPS
-- PostgreSQL/Supabase Implementation
-- Version: 3.0 (Updated July 14, 2025)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE DEFINITIONS WITH PROPER RELATIONSHIPS
-- =============================================================================

-- Users table for user profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tutorial_completed BOOLEAN DEFAULT FALSE,
    profile_data JSONB DEFAULT '{}'::jsonb
);

-- Tasks table - Core task management
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Foreign key relationships
    CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Subtasks table - Task decomposition support
CREATE TABLE IF NOT EXISTS public.subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key relationships
    CONSTRAINT fk_subtasks_task_id FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_subtasks_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Notes table - AI-generated and manual notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    topic VARCHAR(255),
    generated_by_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Foreign key relationships
    CONSTRAINT fk_notes_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Meeting summaries table - AI meeting analysis
CREATE TABLE IF NOT EXISTS public.meeting_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    key_points TEXT[] DEFAULT ARRAY[]::TEXT[],
    action_items TEXT[] DEFAULT ARRAY[]::TEXT[],
    participants TEXT[] DEFAULT ARRAY[]::TEXT[],
    meeting_date TIMESTAMP WITH TIME ZONE,
    transcript TEXT,
    audio_url VARCHAR(500),
    duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key relationships
    CONSTRAINT fk_meeting_summaries_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Analytics events table - User interaction tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_value NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key relationships
    CONSTRAINT fk_analytics_events_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Task dependencies table - For task relationships
CREATE TABLE IF NOT EXISTS public.task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    depends_on_task_id UUID NOT NULL,
    dependency_type VARCHAR(50) DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'relates_to')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key relationships
    CONSTRAINT fk_task_dependencies_task_id FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    CONSTRAINT fk_task_dependencies_depends_on FOREIGN KEY (depends_on_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    
    -- Ensure a task can't depend on itself
    CONSTRAINT chk_no_self_dependency CHECK (task_id != depends_on_task_id),
    
    -- Unique constraint to prevent duplicate dependencies
    CONSTRAINT uq_task_dependencies UNIQUE (task_id, depends_on_task_id)
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);

-- Subtasks table indexes
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON public.subtasks(user_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON public.subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_order ON public.subtasks(task_id, order_index);

-- Notes table indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_ai_generated ON public.notes(generated_by_ai);
CREATE INDEX IF NOT EXISTS idx_notes_topic ON public.notes(topic);

-- Meeting summaries table indexes
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_user_id ON public.meeting_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_created_at ON public.meeting_summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_meeting_date ON public.meeting_summaries(meeting_date);

-- Analytics events table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Task dependencies indexes
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks table policies
CREATE POLICY "Users can view own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Subtasks table policies
CREATE POLICY "Users can view own subtasks" ON public.subtasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks" ON public.subtasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks" ON public.subtasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks" ON public.subtasks
    FOR DELETE USING (auth.uid() = user_id);

-- Notes table policies
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Meeting summaries table policies
CREATE POLICY "Users can view own meeting summaries" ON public.meeting_summaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meeting summaries" ON public.meeting_summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meeting summaries" ON public.meeting_summaries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meeting summaries" ON public.meeting_summaries
    FOR DELETE USING (auth.uid() = user_id);

-- Analytics events table policies
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Task dependencies policies
CREATE POLICY "Users can view own task dependencies" ON public.task_dependencies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
    );

CREATE POLICY "Users can insert own task dependencies" ON public.task_dependencies
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = depends_on_task_id AND t.user_id = auth.uid())
    );

CREATE POLICY "Users can delete own task dependencies" ON public.task_dependencies
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid())
    );

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subtasks_updated_at
    BEFORE UPDATE ON public.subtasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_meeting_summaries_updated_at
    BEFORE UPDATE ON public.meeting_summaries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subtasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_dependencies TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;