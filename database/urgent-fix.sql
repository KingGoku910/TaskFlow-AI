-- URGENT: Quick fix for 'pending' status constraint
-- Run this IMMEDIATELY in your Supabase SQL Editor to fix the constraint error

-- Drop the existing constraint that's blocking 'pending' status
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Add the new constraint that allows 'pending' status
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'pending', 'in_progress', 'completed'));

-- Notification
DO $$
BEGIN
    RAISE NOTICE '🚀 URGENT FIX APPLIED: pending status now allowed!';
END $$;
