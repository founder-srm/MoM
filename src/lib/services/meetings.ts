/**
 * Meetings service — all Supabase interactions for the meetings table.
 * API routes and server actions MUST use this service; components must not
 * query Supabase directly.
 */
import { type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"
import { MEETING_STATUS } from "@/lib/constants"
import { logger } from "@/lib/logger"
import type { CreateMeetingInput, UpdateMeetingInput } from "@/lib/validations/meetings"

type MeetingRow = Database["public"]["Tables"]["meetings"]["Row"]

export async function getMeetingsByUser(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<MeetingRow[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    logger.error("MeetingsService", "getMeetingsByUser failed", { error, userId })
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getMeetingById(
  supabase: SupabaseClient<Database>,
  meetingId: string,
  userId: string,
): Promise<MeetingRow | null> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null // not found
    logger.error("MeetingsService", "getMeetingById failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

export async function createMeeting(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateMeetingInput,
): Promise<MeetingRow> {
  const { data, error } = await supabase
    .from("meetings")
    .insert({
      user_id: userId,
      title: input.title,
      date: input.date ?? null,
      participants: input.participants ?? null,
      description: input.description ?? null,
      status: MEETING_STATUS.CREATED,
    })
    .select()
    .single()

  if (error) {
    logger.error("MeetingsService", "createMeeting failed", { error, userId })
    throw new Error(error.message)
  }

  logger.info("MeetingsService", "Meeting created", { meetingId: data.meeting_id })
  return data
}

export async function updateMeeting(
  supabase: SupabaseClient<Database>,
  meetingId: string,
  userId: string,
  input: UpdateMeetingInput,
): Promise<MeetingRow> {
  const { data, error } = await supabase
    .from("meetings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    logger.error("MeetingsService", "updateMeeting failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

export async function deleteMeeting(
  supabase: SupabaseClient<Database>,
  meetingId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)

  if (error) {
    logger.error("MeetingsService", "deleteMeeting failed", { error, meetingId })
    throw new Error(error.message)
  }

  logger.info("MeetingsService", "Meeting deleted", { meetingId })
}
