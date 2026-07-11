/**
 * Server action to trigger transcription for a meeting.
 * Calls /api/transcribe and updates meeting state.
 */
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { updateMeeting } from "@/lib/services/meetings"
import { MEETING_STATUS } from "@/lib/constants"
import { logger } from "@/lib/logger"

export async function transcribeMeeting(meetingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  try {
    await updateMeeting(supabase, meetingId, user.id, { status: MEETING_STATUS.TRANSCRIBING })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meeting_id: meetingId }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      logger.error("actions.transcribeMeeting", "API responded with error", err)
      await updateMeeting(supabase, meetingId, user.id, { status: MEETING_STATUS.FAILED })
      return { error: err.error ?? "Transcription failed" }
    }

    revalidatePath("/dashboard")
    revalidatePath(`/meetings/${meetingId}/transcript`)
    return { success: true }
  } catch (err) {
    logger.error("actions.transcribeMeeting", "Unhandled error", err)
    await updateMeeting(supabase, meetingId, user.id, { status: MEETING_STATUS.FAILED })
    return { error: "Transcription failed unexpectedly" }
  }
}