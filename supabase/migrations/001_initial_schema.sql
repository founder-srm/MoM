-- ============================================================
-- MoM Generator — Initial Schema Migration
-- Migration: 001_initial_schema.sql
-- Run this in: Supabase SQL Editor (or via Supabase CLI)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.meeting_status AS ENUM (
  'created',
  'uploaded',
  'transcribing',
  'summarizing',
  'completed',
  'failed'
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'One row per authenticated user, mirror of auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'Matches auth.users.id exactly.';
COMMENT ON COLUMN public.profiles.email IS 'Denormalized email for app display.';

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

CREATE TABLE IF NOT EXISTS public.meetings (
  meeting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 200),
  date DATE,
  participants TEXT,
  description TEXT,
  status public.meeting_status NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.meetings IS 'Central record for each meeting session.';
COMMENT ON COLUMN public.meetings.status IS 'Lifecycle: created → uploaded → transcribing → summarizing → completed | failed.';

CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings (user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON public.meetings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings (status);

CREATE TABLE IF NOT EXISTS public.audio_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(meeting_id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL CHECK (char_length(trim(storage_path)) > 0),
  storage_url TEXT,
  file_name TEXT,
  file_size BIGINT CHECK (file_size > 0),
  mime_type TEXT CHECK (mime_type IS NULL OR char_length(trim(mime_type)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audio_files IS 'Metadata for audio files stored in Supabase Storage.';
COMMENT ON COLUMN public.audio_files.storage_path IS 'Relative path inside the meeting-audio bucket.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_audio_files_meeting_id ON public.audio_files (meeting_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_meeting_id ON public.audio_files (meeting_id);

CREATE TABLE IF NOT EXISTS public.transcripts (
  transcript_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(meeting_id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL CHECK (char_length(trim(transcript_text)) > 0),
  edited_text TEXT,
  language TEXT CHECK (language IS NULL OR char_length(trim(language)) BETWEEN 2 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.transcripts IS 'Raw and user-edited transcript for each meeting.';
COMMENT ON COLUMN public.transcripts.edited_text IS 'User-edited version; used for summarization when present.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_transcripts_meeting_id ON public.transcripts (meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_meeting_id ON public.transcripts (meeting_id);

CREATE TABLE IF NOT EXISTS public.summaries (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(meeting_id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL CHECK (char_length(trim(summary_text)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.summaries IS 'Executive summary produced by the local LLM.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_summaries_meeting_id ON public.summaries (meeting_id);
CREATE INDEX IF NOT EXISTS idx_summaries_meeting_id ON public.summaries (meeting_id);

CREATE TABLE IF NOT EXISTS public.moms (
  mom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(meeting_id) ON DELETE CASCADE,
  mom_content TEXT NOT NULL CHECK (char_length(trim(mom_content)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.moms IS 'Structured JSON MoM output from the local LLM.';
COMMENT ON COLUMN public.moms.mom_content IS 'Raw JSON string matching the MomJson TypeScript interface.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_moms_meeting_id ON public.moms (meeting_id);
CREATE INDEX IF NOT EXISTS idx_moms_meeting_id ON public.moms (meeting_id);
