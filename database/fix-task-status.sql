-- ============================================================================= 
-- FIX TASK STATUS CONSTRAINT AND ADD ARCHIVING SUPPORT
-- PostgreSQL/Supabase Implementation
-- =============================================================================

-- Drop the existing constraint
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add the new constraint with 'pending' status included
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'pending', 'in_progress', 'completed'));

-- Ensure the is_archived column exists (it should from the complete schema)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add archived_at column for tracking when tasks were archived
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Create index for archived tasks queries
CREATE INDEX IF NOT EXISTS idx_tasks_archived ON public.tasks(is_archived, user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON public.tasks(archived_at) WHERE archived_at IS NOT NULL;

-- Function to auto-archive completed tasks after 24 hours
CREATE OR REPLACE FUNCTION public.auto_archive_completed_tasks()
RETURNS void AS $$
BEGIN
    -- Archive completed tasks that are older than 24 hours
    UPDATE public.tasks 
    SET 
        is_archived = TRUE,
        archived_at = NOW()
    WHERE 
        status = 'completed' 
        AND is_archived = FALSE 
        AND updated_at < NOW() - INTERVAL '24 hours';
        
    -- Log the operation (optional)
    INSERT INTO public.analytics_events (user_id, event_type, event_value, metadata)
    SELECT DISTINCT 
        user_id,
        'auto_archive_tasks',
        1,
        jsonb_build_object('archived_at', NOW())
    FROM public.tasks 
    WHERE is_archived = TRUE AND archived_at = NOW()::date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.auto_archive_completed_tasks() TO authenticated;

-- Create a scheduled job trigger (you'll need to set this up in Supabase dashboard or via pg_cron)
-- This is just the function definition - actual scheduling needs to be done separately
DO $$
BEGIN
    RAISE NOTICE '✅ Task status constraint updated to include pending status';
    RAISE NOTICE '✅ Auto-archiving function created';
    RAISE NOTICE '📝 Note: You need to set up a cron job to call auto_archive_completed_tasks() every hour';
    RAISE NOTICE '📝 In Supabase, go to Database → Extensions → Enable pg_cron';
    RAISE NOTICE '📝 Then run: SELECT cron.schedule(''auto-archive-tasks'', ''0 * * * *'', ''SELECT public.auto_archive_completed_tasks();'');';
END $$;
