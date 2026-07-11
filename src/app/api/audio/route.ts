import { createClient } from "@/lib/supabase/server"
import { apiSuccess, unauthorized, badRequest, internalError } from "@/lib/api-response"
import { createAudioFileSchema } from "@/lib/validations/audio"
import { createAudioFile } from "@/lib/services/audio"
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
    const parsed = createAudioFileSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "))
    }

    const audioFile = await createAudioFile(supabase, parsed.data)
    return apiSuccess(audioFile, "Audio file recorded", 201)
  } catch (err) {
    logger.error("POST /api/audio", "Unhandled error", err)
    return internalError()
  }
}
