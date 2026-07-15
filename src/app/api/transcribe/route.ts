import { NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai/whisper";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type TranscribeRequestBody = {
  meeting_id?: string;
  audio_file_id?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: TranscribeRequestBody = await request.json();
    const { meeting_id, audio_file_id } = body;

    if (!meeting_id || !audio_file_id) {
      return NextResponse.json(
        { error: "meeting_id and audio_file_id are required" },
        { status: 400 },
      );
    }

    // Verify meeting exists and belongs to the authenticated user
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("user_id")
      .eq("meeting_id", meeting_id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (meeting.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch audio_files row
    const { data: audioFile, error: audioError } = await supabase
      .from("audio_files")
      .select("storage_url")
      .eq("file_id", audio_file_id)
      .single();

    if (audioError || !audioFile) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 },
      );
    }

    const storageUrl: string = audioFile.storage_url;

    // Generate signed URL if needed (if storage_url is a storage path rather than absolute URL)
    let audioUrl = storageUrl;
    const looksLikeAbsolute = /^https?:\/\//i.test(storageUrl);
    if (!looksLikeAbsolute) {
      const bucket = process.env.SUPABASE_AUDIO_BUCKET || "meeting-audio";
      const expiresSeconds = 60;
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storageUrl, expiresSeconds);

      if (signedError || !signedData?.signedUrl) {
        return NextResponse.json(
          { error: "Failed to create signed URL" },
          { status: 500 },
        );
      }

      audioUrl = signedData.signedUrl;
    }

    try {
      const transcription = await transcribeAudio(
        audioUrl,
        meeting_id,
        audio_file_id,
      );

      // Insert transcript into DB
      type TranscriptInsert =
        Database["public"]["Tables"]["transcripts"]["Insert"];
      const { data: transcript, error: insertError } = await supabase
        .from("transcripts")
        .insert([
          {
            meeting_id,
            transcript_text: transcription.transcript,
            edited_text: null,
          } as TranscriptInsert,
        ])
        .select()
        .single();

      if (insertError || !transcript) {
        return NextResponse.json(
          { error: insertError?.message || "Failed to insert transcript" },
          { status: 500 },
        );
      }

      // Update meeting status to 'transcribed'
      const { error: updateError } = await supabase
        .from("meetings")
        .update({ status: "transcribed", updated_at: new Date().toISOString() })
        .eq("meeting_id", meeting_id)
        .eq("user_id", user.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        transcript_id: transcript.transcript_id,
        meeting_id: transcript.meeting_id,
        transcript_text: transcript.transcript_text,
      });
    } catch (transcriptionError: unknown) {
      const _message =
        transcriptionError instanceof Error
          ? transcriptionError.message
          : "Transcription failed";

      // Log technical details server-side only
      console.error("Transcription error:", transcriptionError);

      // Return user-friendly error
      return NextResponse.json(
        {
          error:
            "Unable to connect to the transcription service. Please try again later.",
        },
        { status: 503 },
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
