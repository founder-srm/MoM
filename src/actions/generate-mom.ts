/**
 * Server action to generate summary and MoM from transcript using AI.
 * Calls /api/summarize and updates meeting state.
 */
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { updateMeeting } from "@/lib/services/meetings"
import { MEETING_STATUS } from "@/lib/constants"
import { logger } from "@/lib/logger"

export async function generateMom(meetingId: string) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  try {
    await updateMeeting(supabase, meetingId, user.id, { status: MEETING_STATUS.SUMMARIZING })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meeting_id: meetingId }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      logger.error("actions.generateMom", "API responded with error", err)
      await updateMeeting(supabase, meetingId, user.id, { status: MEETING_STATUS.FAILED })
      return { error: err.error ?? "MoM generation failed" }
    }

    revalidatePath("/dashboard")
    revalidatePath(`/meetings/${meetingId}/mom`)
    return { success: true }
  } catch (err) {
    logger.error("actions.generateMom", "Unhandled error", err)
    await updateMeeting(supabase, meetingId, user.id, { status: MEETING_STATUS.FAILED })
    return { error: "MoM generation failed unexpectedly" }
  }
}