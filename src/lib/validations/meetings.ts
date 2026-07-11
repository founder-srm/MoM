import { z } from "zod"
import { MEETING_STATUS } from "@/lib/constants"

const statusEnum = z.enum([
  MEETING_STATUS.CREATED,
  MEETING_STATUS.UPLOADED,
  MEETING_STATUS.TRANSCRIBING,
  MEETING_STATUS.SUMMARIZING,
  MEETING_STATUS.COMPLETED,
  MEETING_STATUS.FAILED,
])

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  date: z.string().optional(),
  participants: z.string().optional(),
  description: z.string().optional(),
})

export const updateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.string().optional(),
  participants: z.string().optional(),
  description: z.string().optional(),
  status: statusEnum.optional(),
})

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>
