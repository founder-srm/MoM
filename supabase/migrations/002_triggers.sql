-- ============================================================================
-- 002_triggers.sql
-- Trigger functions and triggers
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Trigger Function: Automatically update updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Trigger Function: Automatically create profile after Auth signup
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

  RETURN NEW;
END;
$$;

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