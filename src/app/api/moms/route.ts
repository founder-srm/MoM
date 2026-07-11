<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const meeting_id: string = body.meeting_id;
    const mom_content: string = body.mom_content;

    if (!meeting_id || !mom_content) {
      return NextResponse.json(
        { error: "meeting_id and mom_content are required" },
        { status: 400 },
      );
    }

    const { data: mom, error } = await supabase
      .from("moms")
      .insert({
        meeting_id,
        mom_content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(mom);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
  }
}
