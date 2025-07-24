-- Simple migration to add archiving support to existing database
-- Run this in your Supabase SQL Editor

-- Add the missing columns if they don't exist
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Update the constraint to allow 'pending' status
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'pending', 'in_progress', 'completed'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON public.tasks(is_archived, user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON public.tasks(archived_at) WHERE archived_at IS NOT NULL;

-- Simple notification
DO $$
BEGIN
    RAISE NOTICE '✅ Database updated successfully!';
    RAISE NOTICE '✅ Added is_archived column';
    RAISE NOTICE '✅ Added archived_at column';
    RAISE NOTICE '✅ Updated status constraint to include pending';
    RAISE NOTICE '✅ Added performance indexes';
END $$;
