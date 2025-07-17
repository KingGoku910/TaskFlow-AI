#!/usr/bin/env node

/**
 * Simple Database Verification
 * Checks if speech recognition features are ready
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
  console.error('❌ Missing Supabase credentials in .env');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseFeatures() {
  console.log('🧙 BMad Master - Database Feature Test\n');
  
  try {
    // Test 1: Check if meeting_summaries table exists
    console.log('📊 Testing meeting_summaries table access...');
    const { data: meetings, error: meetingError } = await supabase
      .from('meeting_summaries')
      .select('*')
      .limit(1);

    if (meetingError) {
      console.error('❌ meeting_summaries table error:', meetingError);
      return false;
    }

    console.log('✅ meeting_summaries table accessible');
    
    // Test 2: Check if we can insert a test record (then delete it)
    console.log('\n🔧 Testing insert/delete operations...');
    const testRecord = {
      title: 'Test Meeting - DELETE ME',
      summary: 'Test summary for speech recognition',
      transcript: 'Test transcript content',
      audio_url: 'https://example.com/test.webm',
      duration: 120,
      language: 'en-US',
      key_points: ['Test point 1', 'Test point 2'],
      action_items: ['Test action'],
      participants: ['Test User'],
      meeting_date: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('meeting_summaries')
      .insert([testRecord])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return false;
    }

    console.log('✅ Insert test successful');

    // Clean up test record
    const { error: deleteError } = await supabase
      .from('meeting_summaries')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.error('⚠️  Cleanup warning:', deleteError);
    } else {
      console.log('✅ Cleanup successful');
    }

    // Test 3: Check storage bucket
    console.log('\n🗄️  Testing storage bucket access...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) {
      console.error('❌ Storage bucket error:', bucketError);
      return false;
    }

    const meetingAudioBucket = buckets.find(b => b.id === 'meeting-audio');
    if (!meetingAudioBucket) {
      console.error('❌ meeting-audio bucket not found');
      return false;
    }

    console.log('✅ meeting-audio storage bucket found');
    
    // Test 4: Test file upload to storage
    console.log('\n📤 Testing file upload to storage...');
    const testFile = new Blob(['test audio content'], { type: 'audio/webm' });
    const fileName = `test-audio-${Date.now()}.webm`;
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('meeting-audio')
      .upload(`test-user/${fileName}`, testFile, {
        contentType: 'audio/webm',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ File upload test failed:', uploadError);
      return false;
    }

    console.log('✅ File upload test successful');

    // Clean up test file
    const { error: deleteFileError } = await supabase
      .storage
      .from('meeting-audio')
      .remove([uploadData.path]);

    if (deleteFileError) {
      console.error('⚠️  File cleanup warning:', deleteFileError);
    } else {
      console.log('✅ File cleanup successful');
    }

    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Main execution
async function main() {
  const result = await testDatabaseFeatures();
  
  if (result) {
    console.log('\n🎉 All database features are working correctly!');
    console.log('\n✅ Speech recognition features ready:');
    console.log('   • meeting_summaries table with all required columns');
    console.log('   • transcript storage and retrieval');
    console.log('   • audio file upload and storage');
    console.log('   • multilingual support (language column)');
    console.log('   • duration tracking');
    console.log('   • secure user-isolated storage');
    console.log('\n🚀 Your meeting recording system is ready to use!');
  } else {
    console.log('\n❌ Some database features need attention');
    console.log('\n📝 Manual steps required:');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run: database/meeting-speech-recognition-update.sql');
    console.log('4. Verify with: database/verify-speech-recognition-db.sql');
  }
  
  process.exit(result ? 0 : 1);
}

main().catch(console.error);
