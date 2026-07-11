/**
 * POST /api/transcribe
 *
 * Orchestrates the transcription pipeline:
 * 1. Validates meeting_id and auth
 * 2. Fetches audio record
 * 3. Transcribes via Groq Whisper API
 * 4. Upserts transcript
 * 5. Updates meeting status
 */
import { apiSuccess, apiError, unauthorized, notFound, badRequest, internalError } from "@/lib/api-response"
import { createClient } from "@/lib/supabase/server"
import { transcribeRequestSchema } from "@/lib/validations/transcripts"
import { getAudioFileByMeetingId } from "@/lib/services/audio"
import { upsertTranscript } from "@/lib/services/transcripts"
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
    const parsed = transcribeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((e: any) => e.message).join(", "))
    }

    const { meeting_id } = parsed.data

    const audioFile = await getAudioFileByMeetingId(supabase, meeting_id)
    if (!audioFile) {
      return notFound("Audio file")
    }

    const signedUrl = await getAudioDownloadUrl(supabase, audioFile)

    await updateMeeting(supabase, meeting_id, user.id, { status: MEETING_STATUS.TRANSCRIBING })

    const groq = getGroqClient()

    let transcriptText = ""
    try {
      const transcription = await groq.audio.transcriptions.create({
        file: await fetchFileBlob(signedUrl),
        model: "whisper-large-v3-turbo",
        response_format: "verbose_json",
      })
      transcriptText = transcription.text
    } catch (err) {
      logger.error("POST /api/transcribe", "Groq Whisper failed", err)
      await updateMeeting(supabase, meeting_id, user.id, { status: MEETING_STATUS.FAILED })
      return apiError("Transcription failed", 502)
    }

    const transcript = await upsertTranscript(supabase, {
      meeting_id,
      transcript_text: transcriptText,
    })

    await updateMeeting(supabase, meeting_id, user.id, { status: MEETING_STATUS.COMPLETED })

    return apiSuccess(
      { transcript_id: transcript.transcript_id, text: transcript.transcript_text },
      "Transcription complete",
    )
  } catch (err) {
    logger.error("POST /api/transcribe", "Unhandled error", err)
    return internalError()
  }
}

async function getAudioDownloadUrl(supabase: Awaited<ReturnType<typeof createClient>>, audioFile: NonNullable<Awaited<ReturnType<typeof getAudioFileByMeetingId>>>): Promise<string> {
  const { data, error } = await supabase.storage
    .from("meeting-audio")
    .createSignedUrl(audioFile.storage_path, 3600)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create audio signed URL")
  }

  return data.signedUrl
}

async function fetchFileBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch audio file: ${res.status}`)
  }
  return res.blob()
}
