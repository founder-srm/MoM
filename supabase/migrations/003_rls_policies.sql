-- ============================================================
-- MoM Generator — RLS Policies Migration
-- Migration: 003_rls_policies.sql
-- Must run AFTER 001_initial_schema.sql and 002_triggers.sql
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "meetings_select_own" ON public.meetings;
CREATE POLICY "meetings_select_own"
  ON public.meetings
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meetings_insert_own" ON public.meetings;
CREATE POLICY "meetings_insert_own"
  ON public.meetings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meetings_update_own" ON public.meetings;
CREATE POLICY "meetings_update_own"
  ON public.meetings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meetings_delete_own" ON public.meetings;
CREATE POLICY "meetings_delete_own"
  ON public.meetings
  FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "audio_files_select_own" ON public.audio_files;
CREATE POLICY "audio_files_select_own"
  ON public.audio_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = audio_files.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "audio_files_insert_own" ON public.audio_files;
CREATE POLICY "audio_files_insert_own"
  ON public.audio_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = audio_files.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "audio_files_update_own" ON public.audio_files;
CREATE POLICY "audio_files_update_own"
  ON public.audio_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = audio_files.meeting_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = audio_files.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "audio_files_delete_own" ON public.audio_files;
CREATE POLICY "audio_files_delete_own"
  ON public.audio_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = audio_files.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transcripts_select_own" ON public.transcripts;
CREATE POLICY "transcripts_select_own"
  ON public.transcripts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = transcripts.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transcripts_insert_own" ON public.transcripts;
CREATE POLICY "transcripts_insert_own"
  ON public.transcripts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = transcripts.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transcripts_update_own" ON public.transcripts;
CREATE POLICY "transcripts_update_own"
  ON public.transcripts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = transcripts.meeting_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = transcripts.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "transcripts_delete_own" ON public.transcripts;
CREATE POLICY "transcripts_delete_own"
  ON public.transcripts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = transcripts.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "summaries_select_own" ON public.summaries;
CREATE POLICY "summaries_select_own"
  ON public.summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = summaries.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "summaries_insert_own" ON public.summaries;
CREATE POLICY "summaries_insert_own"
  ON public.summaries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = summaries.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "summaries_update_own" ON public.summaries;
CREATE POLICY "summaries_update_own"
  ON public.summaries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = summaries.meeting_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = summaries.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "summaries_delete_own" ON public.summaries;
CREATE POLICY "summaries_delete_own"
  ON public.summaries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = summaries.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "moms_select_own" ON public.moms;
CREATE POLICY "moms_select_own"
  ON public.moms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = moms.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "moms_insert_own" ON public.moms;
CREATE POLICY "moms_insert_own"
  ON public.moms
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = moms.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "moms_update_own" ON public.moms;
CREATE POLICY "moms_update_own"
  ON public.moms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = moms.meeting_id
        AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = moms.meeting_id
        AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "moms_delete_own" ON public.moms;
CREATE POLICY "moms_delete_own"
  ON public.moms
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.meetings m
      WHERE m.meeting_id = moms.meeting_id
        AND m.user_id = auth.uid()
    )
  );
