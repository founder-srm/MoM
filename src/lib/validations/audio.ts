import { z } from "zod"

export const createAudioFileSchema = z.object({
  meeting_id: z.string().uuid("meeting_id must be a valid UUID"),
  storage_path: z.string().min(1, "storage_path is required"),
  storage_url: z.string().url("storage_url must be a valid URL").optional(),
  file_name: z.string().optional(),
  file_size: z.number().positive().optional(),
  mime_type: z.string().optional(),
})

export type CreateAudioFileInput = z.infer<typeof createAudioFileSchema>
