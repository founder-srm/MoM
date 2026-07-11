import { createClient } from "@/lib/supabase/server"
import {
  apiSuccess,
  unauthorized,
  notFound,
  badRequest,
  internalError,
} from "@/lib/api-response"
import { updateMeetingSchema } from "@/lib/validations/meetings"
import { getMeetingById, updateMeeting, deleteMeeting } from "@/lib/services/meetings"
import { logger } from "@/lib/logger"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  // TODO: Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    const meeting = await getMeetingById(supabase, id, user.id)
    if (!meeting) return notFound("Meeting")

    return apiSuccess(meeting)
  } catch (err) {
    logger.error("GET /api/meetings/[id]", "Unhandled error", err)
    return internalError()
  }
}

export async function PATCH(request: Request, { params }: Params) {
  // TODO: Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    const body = await request.json()
    const parsed = updateMeetingSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "))
    }

    const meeting = await updateMeeting(supabase, id, user.id, parsed.data)
    return apiSuccess(meeting)
  } catch (err) {
    logger.error("PATCH /api/meetings/[id]", "Unhandled error", err)
    return internalError()
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  // TODO: Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    await deleteMeeting(supabase, id, user.id)
    return apiSuccess(null, "Meeting deleted")
  } catch (err) {
    logger.error("DELETE /api/meetings/[id]", "Unhandled error", err)
    return internalError()
  }
}
