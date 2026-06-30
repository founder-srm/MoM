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
  }
}
