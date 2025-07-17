-- =============================================================================
-- SUPABASE STORAGE SETUP FOR MEETING AUDIO
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Create storage bucket for meeting audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-audio',
  'meeting-audio',
  true,
  52428800, -- 50MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for meeting audio
CREATE POLICY "Users can upload their own meeting audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meeting-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own meeting audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'meeting-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own meeting audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'meeting-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify storage bucket creation
SELECT * FROM storage.buckets WHERE id = 'meeting-audio';
