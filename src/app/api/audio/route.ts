<<<<<<< HEAD
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
    const storage_url: string = body.storage_url;
    const file_name: string | null = body.file_name ?? null;
    const file_size: number | null = body.file_size ?? null;

    if (!meeting_id || !storage_url) {
      return NextResponse.json(
        { error: "meeting_id and storage_url are required" },
        { status: 400 },
      );
    }

    const { data: audioFile, error } = await supabase
      .from("audio_files")
      .insert({
        meeting_id,
        storage_url,
        file_name,
        file_size,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(audioFile);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
  }
}
