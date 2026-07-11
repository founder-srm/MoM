/**
 * MoMs service — all Supabase interactions for the moms table.
 */
import { type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"
import { logger } from "@/lib/logger"
import type { CreateMomInput } from "@/lib/validations/moms"

type MomRow = Database["public"]["Tables"]["moms"]["Row"]

export async function getMomByMeetingId(
  supabase: SupabaseClient<Database>,
  meetingId: string,
): Promise<MomRow | null> {
  const { data, error } = await supabase
    .from("moms")
    .select("*")
    .eq("meeting_id", meetingId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("MomsService", "getMomByMeetingId failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

export async function upsertMom(
  supabase: SupabaseClient<Database>,
  input: CreateMomInput,
): Promise<MomRow> {
  const { data, error } = await supabase
    .from("moms")
    .upsert(
      {
        meeting_id: input.meeting_id,
        mom_content: input.mom_content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "meeting_id" },
    )
    .select()
    .single()

  if (error) {
    logger.error("MomsService", "upsertMom failed", { error })
    throw new Error(error.message)
  }

  logger.info("MomsService", "MoM upserted", { meetingId: input.meeting_id })
  return data
}
