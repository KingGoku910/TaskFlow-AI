#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes the speech recognition database updates
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env
const envPath = join(__dirname, '..', '.env');
let supabaseUrl, supabaseKey;

try {
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
} catch (error) {
  console.error('❌ Error loading environment variables:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting database migration for speech recognition features...\n');

  try {
    // Load the migration SQL
    const migrationPath = join(__dirname, '..', 'database', 'meeting-speech-recognition-update.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Loaded migration SQL from:', migrationPath);
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }

    console.log('✅ Migration completed successfully!');
    
    // Run verification
    const verificationPath = join(__dirname, '..', 'database', 'verify-speech-recognition-db.sql');
    const verificationSQL = readFileSync(verificationPath, 'utf8');
    
    console.log('\n🔍 Running verification checks...');
    
    const { data: verifyData, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: verificationSQL
    });

    if (verifyError) {
      console.error('⚠️  Verification failed:', verifyError);
      return false;
    }

    console.log('✅ Verification completed successfully!');
    console.log('\n🎉 Database is ready for speech recognition features!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Alternative approach: Direct SQL execution
async function runDirectSQL() {
  console.log('🔧 Attempting direct SQL execution...\n');
  
  try {
    // Check if meeting_summaries table exists and has required columns
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'meeting_summaries');

    if (tableError) {
      console.error('❌ Error checking table structure:', tableError);
      return false;
    }

    console.log('📊 Current meeting_summaries table structure:');
    console.table(tableInfo);

    // Check for required columns
    const requiredColumns = ['transcript', 'audio_url', 'duration', 'language'];
    const existingColumns = tableInfo.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}`);
      console.log('💡 Please run the SQL migration manually in Supabase dashboard');
      return false;
    }

    console.log('✅ All required columns are present!');
    
    // Test a simple query to verify functionality
    const { data: testData, error: testError } = await supabase
      .from('meeting_summaries')
      .select('id, title, transcript, audio_url, duration, language')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing table access:', testError);
      return false;
    }

    console.log('✅ Table access test successful!');
    console.log('\n🎉 Database verification complete - speech recognition features are ready!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during direct SQL execution:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🧙 BMad Master - Database Migration Runner\n');
  
  // First try direct SQL approach (more likely to work)
  const directResult = await runDirectSQL();
  
  if (!directResult) {
    console.log('\n📝 Manual Migration Required:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the SQL from: database/meeting-speech-recognition-update.sql');
    console.log('4. Verify with: database/verify-speech-recognition-db.sql');
  }
  
  process.exit(directResult ? 0 : 1);
}

main().catch(console.error);
