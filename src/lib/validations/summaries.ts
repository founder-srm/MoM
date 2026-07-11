import { z } from "zod"

export const createSummarySchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
  summary_text: z.string().min(1, "summary_text is required"),
})

// Used by /api/summarize
export const summarizeRequestSchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
})

export type CreateSummaryInput = z.infer<typeof createSummarySchema>
export type SummarizeRequest = z.infer<typeof summarizeRequestSchema>
