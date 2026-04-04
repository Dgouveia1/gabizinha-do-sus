-- Migration: Tabela de gravações de aula + bucket de storage
-- Aplique no painel Supabase → SQL Editor

-- 1. Tabela de gravações
CREATE TABLE IF NOT EXISTS notebook_recordings (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id           uuid REFERENCES notebook_pages(id) ON DELETE CASCADE,
  user_id           uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url          text NOT NULL,
  file_name         text,
  duration_seconds  integer DEFAULT 0,
  transcript        text,
  transcript_status text DEFAULT 'pending', -- pending | processing | done | error
  created_at        timestamptz DEFAULT now()
);

-- 2. RLS
ALTER TABLE notebook_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON notebook_recordings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Index
CREATE INDEX IF NOT EXISTS notebook_recordings_page_id_idx ON notebook_recordings(page_id);

-- 4. Bucket notebook-recordings (crie manualmente no painel Storage se não existir):
-- Name: notebook-recordings
-- Public: false (acesso via signed URLs)
-- Allowed MIME types: audio/webm, audio/ogg, audio/mpeg, audio/mp4
-- Max file size: 200 MB

-- 5. Storage policy (run after creating bucket)
CREATE POLICY "owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'notebook-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "owner_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'notebook-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'notebook-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
