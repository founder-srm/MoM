import { createClient } from "@/lib/supabase/server"
import { apiSuccess, apiError, unauthorized, badRequest, internalError } from "@/lib/api-response"
import { createMeetingSchema } from "@/lib/validations/meetings"
import { getMeetingsByUser, createMeeting } from "@/lib/services/meetings"
import { logger } from "@/lib/logger"

export async function GET() {
  // TODO: Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    const meetings = await getMeetingsByUser(supabase, user.id)
    return apiSuccess(meetings)
  } catch (err) {
    logger.error("GET /api/meetings", "Unhandled error", err)
    return internalError()
  }
}

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
    const parsed = createMeetingSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "))
    }

    const meeting = await createMeeting(supabase, user.id, parsed.data)
    return apiSuccess(meeting, "Meeting created", 201)
  } catch (err) {
    logger.error("POST /api/meetings", "Unhandled error", err)
    return internalError()
  }
}
