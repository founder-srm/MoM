/**
 * POST /api/summarize
 *
 * AI pipeline: generate summary and MoM from transcript using Groq LLM.
 * 1. Validates meeting_id and auth
 * 2. Fetches transcript
 * 3. Generates summary via Groq
 * 4. Generates MoM via Groq
 * 5. Saves both to database
 * 6. Updates meeting status to completed
 */
import { apiSuccess, apiError, unauthorized, notFound, badRequest, internalError } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { summarizeRequestSchema } from "@/lib/validations/summaries"
import { getTranscriptByMeetingId, resolveTranscriptText } from "@/lib/services/transcripts"
import { upsertSummary } from "@/lib/services/summaries"
import { upsertMom } from "@/lib/services/moms"
import { updateMeeting } from "@/lib/services/meetings"
import { MEETING_STATUS } from "@/lib/constants"
import { getGroqClient } from "@/lib/groq"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) return unauthorized()

    const body = await request.json()
    const parsed = summarizeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: any) => e.message).join(", "))
    }

    const { meeting_id } = parsed.data

    const transcript = await getTranscriptByMeetingId(supabase, meeting_id)
    if (!transcript) {
      return notFound("Transcript")
    }

    await updateMeeting(supabase, meeting_id, user.id, { status: MEETING_STATUS.SUMMARIZING })

    const { text: transcriptText } = resolveTranscriptText(transcript)
    const groq = getGroqClient()

    let summaryText = ""
    let momContent = ""
    try {
      const summaryCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert meeting assistant. Generate concise meeting summaries.",
          },
          {
            role: "user",
            content: `Summarize the following meeting transcript. Extract key points, decisions, and action items:\n\n${transcriptText}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      })

      const momCompletion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert meeting assistant. Generate professional Minutes of Meeting.",
          },
          {
            role: "user",
            content: `Generate a structured Minutes of Meeting document in Markdown from this transcript. Include: Meeting title/date, attendees, agenda, discussion points, decisions, and action items with owners.\n\n${transcriptText}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })

      summaryText = summaryCompletion.choices[0]?.message?.content ?? "summary"
      momContent = momCompletion.choices[0]?.message?.content ?? "mom"
    } catch (err) {
      logger.error("POST /api/summarize", "Groq generation failed", err)
      await updateMeeting(supabase, meeting_id, user.id, { status: MEETING_STATUS.FAILED })
      return apiError("Summary generation failed", 502)
    }

    const [summary, mom] = await Promise.all([
      upsertSummary(supabase, { meeting_id, summary_text: summaryText }),
      upsertMom(supabase, { meeting_id, mom_content: momContent }),
    ])

    await updateMeeting(supabase, meeting_id, user.id, { status: MEETING_STATUS.COMPLETED })

    return apiSuccess(
      { summary, mom },
      "Summary and MoM generated",
    )
  } catch (err) {
    logger.error("POST /api/summarize", "Unhandled error", err)
    return internalError()
  }
}

function msg(fallback: string, completion: any): string {
  try {
    return completion.choices[0]?.message?.content ?? fallback
  } catch {
    return fallback
  }
}