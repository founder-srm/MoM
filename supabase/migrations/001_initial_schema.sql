CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE public.meeting_status AS ENUM (
    'created',
    'processing',
    'uploaded',
    'transcribing',
    'transcribed',
    'summarizing',
    'completed',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- ===========================
-- Profiles
-- ===========================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  name TEXT,

  email TEXT UNIQUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- Meetings
-- ===========================

CREATE TABLE IF NOT EXISTS public.meetings (
  meeting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,

  date TIMESTAMPTZ NOT NULL DEFAULT now(),

  description TEXT,

  participants TEXT,

  status public.meeting_status NOT NULL DEFAULT 'processing',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT meetings_title_not_empty
    CHECK (length(btrim(title)) > 0)
);

-- ===========================
-- Audio Files
-- ===========================

CREATE TABLE IF NOT EXISTS public.audio_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  meeting_id UUID NOT NULL
    REFERENCES public.meetings(meeting_id)
    ON DELETE CASCADE,

  storage_url TEXT NOT NULL,

  file_name TEXT,

  file_size BIGINT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT audio_files_storage_url_not_empty
    CHECK (length(btrim(storage_url)) > 0),

  CONSTRAINT audio_files_file_size_non_negative
    CHECK (file_size IS NULL OR file_size >= 0)
);

-- ===========================
-- Transcripts
-- ===========================

CREATE TABLE IF NOT EXISTS public.transcripts (
  transcript_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  meeting_id UUID NOT NULL
    REFERENCES public.meetings(meeting_id)
    ON DELETE CASCADE,

  transcript_text TEXT NOT NULL,

  edited_text TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT transcripts_transcript_text_not_empty
    CHECK (length(btrim(transcript_text)) > 0)
);

-- ===========================
-- Summaries
-- ===========================

CREATE TABLE IF NOT EXISTS public.summaries (
  summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  meeting_id UUID NOT NULL
    REFERENCES public.meetings(meeting_id)
    ON DELETE CASCADE,

  summary_text TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT summaries_summary_text_not_empty
    CHECK (length(btrim(summary_text)) > 0)
);

-- ===========================
-- Minutes of Meeting
-- ===========================

CREATE TABLE IF NOT EXISTS public.moms (
  mom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  meeting_id UUID NOT NULL
    REFERENCES public.meetings(meeting_id)
    ON DELETE CASCADE,

  mom_content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT moms_mom_content_not_empty
    CHECK (length(btrim(mom_content)) > 0)
);

-- ===========================
-- Indexes
-- ===========================

CREATE INDEX IF NOT EXISTS meetings_user_id_idx
ON public.meetings(user_id);

CREATE INDEX IF NOT EXISTS meetings_user_created_at_idx
ON public.meetings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS meetings_status_idx
ON public.meetings(status);

CREATE INDEX IF NOT EXISTS audio_files_meeting_id_idx
ON public.audio_files(meeting_id);

CREATE INDEX IF NOT EXISTS transcripts_meeting_id_idx
ON public.transcripts(meeting_id);

CREATE INDEX IF NOT EXISTS summaries_meeting_id_idx
ON public.summaries(meeting_id);

CREATE INDEX IF NOT EXISTS moms_meeting_id_idx
ON public.moms(meeting_id);