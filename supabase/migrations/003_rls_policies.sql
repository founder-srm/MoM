-- ============================================================================
-- 003_rls_policies.sql
-- Row Level Security policies
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moms ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Profiles Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- Meetings Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "meetings_select_own" ON public.meetings;
CREATE POLICY "meetings_select_own"
ON public.meetings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "meetings_insert_own" ON public.meetings;
CREATE POLICY "meetings_insert_own"
ON public.meetings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "meetings_update_own" ON public.meetings;
CREATE POLICY "meetings_update_own"
ON public.meetings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "meetings_delete_own" ON public.meetings;
CREATE POLICY "meetings_delete_own"
ON public.meetings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Audio Files Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "audio_files_select_own_meeting" ON public.audio_files;
CREATE POLICY "audio_files_select_own_meeting"
ON public.audio_files
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = audio_files.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "audio_files_insert_own_meeting" ON public.audio_files;
CREATE POLICY "audio_files_insert_own_meeting"
ON public.audio_files
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = audio_files.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "audio_files_update_own_meeting" ON public.audio_files;
CREATE POLICY "audio_files_update_own_meeting"
ON public.audio_files
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = audio_files.meeting_id
      AND meetings.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = audio_files.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "audio_files_delete_own_meeting" ON public.audio_files;
CREATE POLICY "audio_files_delete_own_meeting"
ON public.audio_files
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = audio_files.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Transcripts Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "transcripts_select_own_meeting" ON public.transcripts;
CREATE POLICY "transcripts_select_own_meeting"
ON public.transcripts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = transcripts.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "transcripts_insert_own_meeting" ON public.transcripts;
CREATE POLICY "transcripts_insert_own_meeting"
ON public.transcripts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = transcripts.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "transcripts_update_own_meeting" ON public.transcripts;
CREATE POLICY "transcripts_update_own_meeting"
ON public.transcripts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = transcripts.meeting_id
      AND meetings.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = transcripts.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "transcripts_delete_own_meeting" ON public.transcripts;
CREATE POLICY "transcripts_delete_own_meeting"
ON public.transcripts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = transcripts.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- Summaries Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "summaries_select_own_meeting" ON public.summaries;
CREATE POLICY "summaries_select_own_meeting"
ON public.summaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "summaries_insert_own_meeting" ON public.summaries;
CREATE POLICY "summaries_insert_own_meeting"
ON public.summaries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "summaries_update_own_meeting" ON public.summaries;
CREATE POLICY "summaries_update_own_meeting"
ON public.summaries
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "summaries_delete_own_meeting" ON public.summaries;
CREATE POLICY "summaries_delete_own_meeting"
ON public.summaries
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = summaries.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- MoMs Policies
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "moms_select_own_meeting" ON public.moms;
CREATE POLICY "moms_select_own_meeting"
ON public.moms
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = moms.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "moms_insert_own_meeting" ON public.moms;
CREATE POLICY "moms_insert_own_meeting"
ON public.moms
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = moms.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "moms_update_own_meeting" ON public.moms;
CREATE POLICY "moms_update_own_meeting"
ON public.moms
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = moms.meeting_id
      AND meetings.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = moms.meeting_id
      AND meetings.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "moms_delete_own_meeting" ON public.moms;
CREATE POLICY "moms_delete_own_meeting"
ON public.moms
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE meetings.meeting_id = moms.meeting_id
      AND meetings.user_id = auth.uid()
  )
);
-- ============================================================================
-- Revoke anonymous access
-- ============================================================================

REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.meetings FROM anon;
REVOKE ALL ON TABLE public.audio_files FROM anon;
REVOKE ALL ON TABLE public.transcripts FROM anon;
REVOKE ALL ON TABLE public.summaries FROM anon;
REVOKE ALL ON TABLE public.moms FROM anon;

REVOKE ALL ON TABLE public.profiles FROM public;
REVOKE ALL ON TABLE public.meetings FROM public;
REVOKE ALL ON TABLE public.audio_files FROM public;
REVOKE ALL ON TABLE public.transcripts FROM public;
REVOKE ALL ON TABLE public.summaries FROM public;
REVOKE ALL ON TABLE public.moms FROM public;