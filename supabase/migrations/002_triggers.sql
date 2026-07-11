<<<<<<< HEAD
-- ============================================================
-- MoM Generator — Triggers Migration
-- Migration: 002_triggers.sql
-- Must run AFTER 001_initial_schema.sql
-- ============================================================
=======
-- ============================================================================
-- 002_triggers.sql
-- Trigger functions and triggers
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Trigger Function: Automatically update updated_at
-- -----------------------------------------------------------------------------
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

<<<<<<< HEAD
DROP TRIGGER IF EXISTS trg_meetings_updated_at ON public.meetings;
CREATE TRIGGER trg_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_transcripts_updated_at ON public.transcripts;
CREATE TRIGGER trg_transcripts_updated_at
  BEFORE UPDATE ON public.transcripts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_moms_updated_at ON public.moms;
CREATE TRIGGER trg_moms_updated_at
  BEFORE UPDATE ON public.moms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
=======
-- -----------------------------------------------------------------------------
-- Trigger Function: Automatically create profile after Auth signup
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
<<<<<<< HEAD
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
=======
  INSERT INTO public.profiles (
    id,
    email,
    name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name'
    )
  )
  ON CONFLICT (id) DO NOTHING;

>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
  RETURN NEW;
END;
$$;

<<<<<<< HEAD
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
=======
-- -----------------------------------------------------------------------------
-- updated_at Triggers
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS set_meetings_updated_at
ON public.meetings;

CREATE TRIGGER set_meetings_updated_at
BEFORE UPDATE
ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


DROP TRIGGER IF EXISTS set_transcripts_updated_at
ON public.transcripts;

CREATE TRIGGER set_transcripts_updated_at
BEFORE UPDATE
ON public.transcripts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


DROP TRIGGER IF EXISTS set_moms_updated_at
ON public.moms;

CREATE TRIGGER set_moms_updated_at
BEFORE UPDATE
ON public.moms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auth Trigger
-- Automatically create a profile when a new auth user signs up
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT
ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
