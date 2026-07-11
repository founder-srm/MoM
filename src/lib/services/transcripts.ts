/**
 * Transcripts service — all Supabase interactions for the transcripts table.
 */
import { type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"
import { logger } from "@/lib/logger"
import type { CreateTranscriptInput } from "@/lib/validations/transcripts"

type TranscriptRow = Database["public"]["Tables"]["transcripts"]["Row"]

export async function getTranscriptByMeetingId(
  supabase: SupabaseClient<Database>,
  meetingId: string,
): Promise<TranscriptRow | null> {
  const { data, error } = await supabase
    .from("transcripts")
    .select("*")
    .eq("meeting_id", meetingId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("TranscriptsService", "getTranscriptByMeetingId failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

export async function upsertTranscript(
  supabase: SupabaseClient<Database>,
  input: CreateTranscriptInput,
): Promise<TranscriptRow> {
  // Supabase upsert on the unique constraint (meeting_id)
  const { data, error } = await supabase
    .from("transcripts")
    .upsert(
      {
        meeting_id: input.meeting_id,
        transcript_text: input.transcript_text,
        edited_text: input.edited_text ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "meeting_id" },
    )
    .select()
    .single()

  if (error) {
    logger.error("TranscriptsService", "upsertTranscript failed", { error })
    throw new Error(error.message)
  }

  logger.info("TranscriptsService", "Transcript upserted", { meetingId: input.meeting_id })
  return data
}

/**
 * Save the user-edited version of the transcript.
 * Looks up by meeting_id (not transcript_id) so the client never needs to
 * track transcript_id separately.
 */
export async function updateEditedText(
  supabase: SupabaseClient<Database>,
  meetingId: string,
  editedText: string,
): Promise<TranscriptRow> {
  const { data, error } = await supabase
    .from("transcripts")
    .update({ edited_text: editedText, updated_at: new Date().toISOString() })
    .eq("meeting_id", meetingId)
    .select()
    .single()

  if (error) {
    logger.error("TranscriptsService", "updateEditedText failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

/**
 * Returns the best available text for summarization:
 * edited_text if present, otherwise transcript_text.
 */
export function resolveTranscriptText(transcript: TranscriptRow): {
  text: string
  version: "edited" | "original"
} {
  if (transcript.edited_text && transcript.edited_text.trim().length > 0) {
    return { text: transcript.edited_text, version: "edited" }
  }
  return { text: transcript.transcript_text, version: "original" }
}
