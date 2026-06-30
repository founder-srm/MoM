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
    const summary_text: string = body.summary_text;

    if (!meeting_id || !summary_text) {
      return NextResponse.json(
        { error: "meeting_id and summary_text are required" },
        { status: 400 },
      );
    }

    const { data: summary, error } = await supabase
      .from("summaries")
      .insert({
        meeting_id,
        summary_text,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(summary);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
