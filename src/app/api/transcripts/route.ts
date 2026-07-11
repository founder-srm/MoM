import { createClient } from "@/lib/supabase/server"
import { apiSuccess, unauthorized, badRequest, internalError } from "@/lib/api-response"
import { createTranscriptSchema, updateTranscriptSchema } from "@/lib/validations/transcripts"
import { upsertTranscript, updateEditedText } from "@/lib/services/transcripts"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  // TODO: Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    const body = await request.json()
    const parsed = createTranscriptSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "))
    }

    const transcript = await upsertTranscript(supabase, parsed.data)
    return apiSuccess(transcript, "Transcript saved", 201)
  } catch (err) {
    logger.error("POST /api/transcripts", "Unhandled error", err)
    return internalError()
  }
}

export async function PATCH(request: Request) {
  // TODO: Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  // NOTE: Uses meeting_id as the lookup key (not transcript_id)
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    const body = await request.json()
    const parsed = updateTranscriptSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "))
    }

    const transcript = await updateEditedText(supabase, parsed.data.meeting_id, parsed.data.edited_text)
    return apiSuccess(transcript, "Edited transcript saved")
  } catch (err) {
    logger.error("PATCH /api/transcripts", "Unhandled error", err)
    return internalError()
  }
}
