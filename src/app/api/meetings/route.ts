<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: meetings, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(meetings);
}

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
    const title: string = body.title;
    const date: string | null = body.date ?? null;
    const description: string | null = body.description ?? null;
    const participants: string | null = body.participants ?? null;
    const status: string = body.status ?? "processing";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        user_id: user.id,
        title,
        date,
        description,
        participants,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(meeting);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
  }
}
