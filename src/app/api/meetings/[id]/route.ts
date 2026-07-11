<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type MeetingUpdate = Database["public"]["Tables"]["meetings"]["Update"];

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: meeting, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("meeting_id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(meeting);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await context.params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: MeetingUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: meeting, error } = await supabase
      .from("meetings")
      .update(updateData)
      .eq("meeting_id", id)
      .eq("user_id", user.id)
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
