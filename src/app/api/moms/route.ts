import { createClient } from "@/lib/supabase/server"
import { apiSuccess, unauthorized, badRequest, internalError } from "@/lib/api-response"
import { createMomSchema } from "@/lib/validations/moms"
import { upsertMom } from "@/lib/services/moms"
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
    const parsed = createMomSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((e) => e.message).join(", "))
    }

    const mom = await upsertMom(supabase, parsed.data)
    return apiSuccess(mom, "MoM saved", 201)
  } catch (err) {
    logger.error("POST /api/moms", "Unhandled error", err)
    return internalError()
  }
}
