import { z } from "zod"

export const createTranscriptSchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
  transcript_text: z.string().min(1, "transcript_text is required"),
  edited_text: z.string().optional(),
})

export const updateTranscriptSchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
  edited_text: z.string().min(1, "edited_text is required"),
})

// Used by /api/transcribe
export const transcribeRequestSchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
})

export type CreateTranscriptInput = z.infer<typeof createTranscriptSchema>
export type UpdateTranscriptInput = z.infer<typeof updateTranscriptSchema>
export type TranscribeRequest = z.infer<typeof transcribeRequestSchema>
