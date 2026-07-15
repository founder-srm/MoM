import { NextResponse } from "next/server";
import { generateSummary, type SummarizeInput } from "@/lib/ai/summarization";
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
    const { transcript, meetingTitle, participants, agenda } =
      body as SummarizeInput;

    if (!transcript) {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 },
      );
    }

    if (!meetingTitle || !participants || !agenda) {
      return NextResponse.json(
        { error: "meetingTitle, participants, and agenda are required" },
        { status: 400 },
      );
    }

    try {
      const structured = await generateSummary({
        transcript,
        meetingTitle,
        participants,
        agenda,
      });

      return NextResponse.json(structured);
    } catch (summarizationError: unknown) {
      // Log technical details server-side only
      console.error("Summarization error:", summarizationError);

      // Return user-friendly error
      return NextResponse.json(
        {
          error: "Unable to generate meeting summary. Please try again later.",
        },
        { status: 502 },
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
