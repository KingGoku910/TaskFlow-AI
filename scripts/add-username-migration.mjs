import { createClient } from '@supabase/supabase-js';

// This script will add the username field to the users table

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // Need service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Let's try to add the username field by checking the current table structure
async function runMigration() {
  try {
    console.log('🔧 Adding username field to users table...');
    
    // First, let's check if the column already exists
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
      return;
    }
    
    const hasUsername = columns.some(col => col.column_name === 'username');
    
    if (hasUsername) {
      console.log('✅ Username field already exists!');
      return;
    }
    
    // Since we can't execute DDL directly, let's try to insert some test data to check permissions
    console.log('� Checking database permissions...');
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database access error:', testError);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('⚠️  However, we need to manually add the username field to the users table.');
    console.log('⚠️  Please run the following SQL in your Supabase dashboard:');
    console.log('');
    console.log('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;');
    console.log('CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error running migration:', error);
  }
}

runMigration();
