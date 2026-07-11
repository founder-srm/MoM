/**
 * Summaries service — all Supabase interactions for the summaries table.
 */
import { type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"
import { logger } from "@/lib/logger"
import type { CreateSummaryInput } from "@/lib/validations/summaries"

type SummaryRow = Database["public"]["Tables"]["summaries"]["Row"]

export async function getSummaryByMeetingId(
  supabase: SupabaseClient<Database>,
  meetingId: string,
): Promise<SummaryRow | null> {
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("meeting_id", meetingId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("SummariesService", "getSummaryByMeetingId failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

export async function upsertSummary(
  supabase: SupabaseClient<Database>,
  input: CreateSummaryInput,
): Promise<SummaryRow> {
  const { data, error } = await supabase
    .from("summaries")
    .upsert(
      { meeting_id: input.meeting_id, summary_text: input.summary_text },
      { onConflict: "meeting_id" },
    )
    .select()
    .single()

  if (error) {
    logger.error("SummariesService", "upsertSummary failed", { error })
    throw new Error(error.message)
  }

  logger.info("SummariesService", "Summary upserted", { meetingId: input.meeting_id })
  return data
}
