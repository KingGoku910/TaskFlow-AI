-- =============================================================================
-- FIX AUTHENTICATION AND SIGNUP ISSUES
-- Addresses RLS policies and user profile creation during signup
-- =============================================================================

-- Ensure the users table exists with the username column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Create index on username for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Drop and recreate users RLS policies with better error handling
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Users table policies - Allow service role to bypass RLS for user creation
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Grant additional permissions to ensure smooth operation
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.subtasks TO service_role;
GRANT ALL ON public.notes TO service_role;
GRANT ALL ON public.meeting_summaries TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.task_dependencies TO service_role;

-- Ensure the username constraint is properly applied
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_username_key;

ALTER TABLE public.users 
ADD CONSTRAINT users_username_key UNIQUE (username);

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Authentication and signup fixes applied successfully!';
    RAISE NOTICE 'Username support added with proper constraints';
    RAISE NOTICE 'RLS policies updated to support service role operations';
    RAISE NOTICE 'Automatic user profile creation trigger installed';
END $$;