import { z } from "zod"

export const createMomSchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
  mom_content: z.string().min(1, "mom_content is required"),
})

// Structured JSON that the LLM must return
export const momJsonSchema = z.object({
  executive_summary: z.string(),
  meeting_summary: z.string(),
  highlights: z.array(z.string()),
  decisions: z.array(z.string()),
  action_items: z.array(
    z.object({
      owner: z.string(),
      task: z.string(),
      deadline: z.string(),
    }),
  ),
  risks: z.array(z.string()),
  sop: z.string(),
})

export type CreateMomInput = z.infer<typeof createMomSchema>
export type MomJson = z.infer<typeof momJsonSchema>
