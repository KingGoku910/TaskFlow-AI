#!/usr/bin/env node

/**
 * Simple Column Check
 * Just checks if the columns exist in the table
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

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('🧙 BMad Master - Column Check\n');
  
  try {
    // Try to select from meeting_summaries with specific columns
    const { data, error } = await supabase
      .from('meeting_summaries')
      .select('id, title, transcript, audio_url, duration, language, meeting_date')
      .limit(1);

    if (error) {
      console.error('❌ Column check failed:', error);
      
      // Check which columns might be missing
      const missingColumns = [];
      if (error.message.includes('transcript')) missingColumns.push('transcript');
      if (error.message.includes('audio_url')) missingColumns.push('audio_url');
      if (error.message.includes('duration')) missingColumns.push('duration');
      if (error.message.includes('language')) missingColumns.push('language');
      if (error.message.includes('meeting_date')) missingColumns.push('meeting_date');
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}`);
        console.log('\n📝 You need to run this SQL again (some parts may have failed):');
        console.log('```sql');
        missingColumns.forEach(col => {
          switch(col) {
            case 'transcript':
              console.log('ALTER TABLE public.meeting_summaries ADD COLUMN transcript TEXT;');
              break;
            case 'audio_url':
              console.log('ALTER TABLE public.meeting_summaries ADD COLUMN audio_url VARCHAR(500);');
              break;
            case 'duration':
              console.log('ALTER TABLE public.meeting_summaries ADD COLUMN duration INTEGER DEFAULT 0;');
              break;
            case 'language':
              console.log('ALTER TABLE public.meeting_summaries ADD COLUMN language VARCHAR(10) DEFAULT \'en-US\';');
              break;
            case 'meeting_date':
              console.log('ALTER TABLE public.meeting_summaries ADD COLUMN meeting_date TIMESTAMP WITH TIME ZONE;');
              break;
          }
        });
        console.log('```');
      }
      
      return false;
    }

    console.log('✅ All required columns exist in meeting_summaries!');
    console.log('\n📊 Column verification successful:');
    console.log('   • transcript - Text storage for full meeting transcripts');
    console.log('   • audio_url - URL storage for audio files');
    console.log('   • duration - Integer storage for meeting duration');
    console.log('   • language - Language code for speech recognition');
    console.log('   • meeting_date - Timestamp for meeting scheduling');
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Check storage bucket
async function checkStorageBucket() {
  console.log('\n🗄️  Checking storage bucket...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Storage bucket check failed:', error);
      return false;
    }
    
    const meetingBucket = buckets.find(bucket => bucket.id === 'meeting-audio');
    
    if (!meetingBucket) {
      console.log('❌ meeting-audio bucket not found');
      console.log('\n📝 You need to create the storage bucket manually:');
      console.log('1. Go to Supabase Dashboard → Storage');
      console.log('2. Create a new bucket named "meeting-audio"');
      console.log('3. Make it public');
      console.log('4. Set file size limit to 50MB');
      return false;
    }
    
    console.log('✅ meeting-audio storage bucket exists');
    console.log(`   • Public: ${meetingBucket.public}`);
    console.log(`   • File size limit: ${meetingBucket.file_size_limit} bytes`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Storage bucket check error:', error);
    return false;
  }
}

async function main() {
  const columnCheck = await checkColumns();
  const storageCheck = await checkStorageBucket();
  
  if (columnCheck && storageCheck) {
    console.log('\n🎉 Database is ready for speech recognition!');
    console.log('\n🚀 You can now use:');
    console.log('   • Real-time speech recognition');
    console.log('   • Audio recording and playback');
    console.log('   • Multilingual support');
    console.log('   • Meeting transcript storage');
  } else {
    console.log('\n⚠️  Some setup steps are still needed (see above)');
  }
  
  process.exit(columnCheck && storageCheck ? 0 : 1);
}

main().catch(console.error);
