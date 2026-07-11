
-- -----------------------------------------------------------------------------
-- Storage Policies: meeting-audio
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "meeting_audio_insert_own_folder" ON storage.objects;
CREATE POLICY "meeting_audio_insert_own_folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'meeting-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.foldername(name))[2] IS NOT NULL
);

DROP POLICY IF EXISTS "meeting_audio_select_own_folder" ON storage.objects;
CREATE POLICY "meeting_audio_select_own_folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'meeting-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "meeting_audio_update_own_folder" ON storage.objects;
CREATE POLICY "meeting_audio_update_own_folder"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'meeting-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'meeting-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (storage.foldername(name))[2] IS NOT NULL
);

DROP POLICY IF EXISTS "meeting_audio_delete_own_folder" ON storage.objects;
CREATE POLICY "meeting_audio_delete_own_folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'meeting-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
