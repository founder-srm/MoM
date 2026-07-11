/**
 * Audio files service — all Supabase interactions for the audio_files table
 * and the meeting-audio Storage bucket.
 */
import { type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"
import { AUDIO_STORAGE_BUCKET } from "@/lib/constants"
import { logger } from "@/lib/logger"
import type { CreateAudioFileInput } from "@/lib/validations/audio"

type AudioFileRow = Database["public"]["Tables"]["audio_files"]["Row"]

export async function createAudioFile(
  supabase: SupabaseClient<Database>,
  input: CreateAudioFileInput,
): Promise<AudioFileRow> {
  const { data, error } = await supabase
    .from("audio_files")
    .insert({
      meeting_id: input.meeting_id,
      storage_path: input.storage_path,
      storage_url: input.storage_url ?? null,
      file_name: input.file_name ?? null,
      file_size: input.file_size ?? null,
      mime_type: input.mime_type ?? null,
    })
    .select()
    .single()

  if (error) {
    logger.error("AudioService", "createAudioFile failed", { error })
    throw new Error(error.message)
  }

  logger.info("AudioService", "Audio file record created", { fileId: data.file_id })
  return data
}

export async function getAudioFileByMeetingId(
  supabase: SupabaseClient<Database>,
  meetingId: string,
): Promise<AudioFileRow | null> {
  const { data, error } = await supabase
    .from("audio_files")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    logger.error("AudioService", "getAudioFileByMeetingId failed", { error, meetingId })
    throw new Error(error.message)
  }

  return data
}

/**
 * Upload an audio blob to Supabase Storage.
 * Returns the storage path (not a signed URL).
 *
 * TODO: Wire this once the Supabase project and bucket are configured.
 */
export async function uploadAudioToStorage(
  supabase: SupabaseClient<Database>,
  userId: string,
  meetingId: string,
  file: Blob | File,
  ext: string,
): Promise<string> {
  const path = `${userId}/${meetingId}/audio.${ext}`

  const { error } = await supabase.storage
    .from(AUDIO_STORAGE_BUCKET)
    .upload(path, file, { upsert: true })

  if (error) {
    logger.error("AudioService", "uploadAudioToStorage failed", { error, path })
    throw new Error(error.message)
  }

  logger.info("AudioService", "Audio uploaded to storage", { path })
  return path
}

/**
 * Get a signed URL for a stored audio file (server-side only).
 * Expires in 1 hour by default.
 */
export async function getSignedAudioUrl(
  supabase: SupabaseClient<Database>,
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(AUDIO_STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error || !data?.signedUrl) {
    logger.error("AudioService", "getSignedAudioUrl failed", { error, storagePath })
    throw new Error(error?.message ?? "Failed to create signed URL")
  }

  return data.signedUrl
}
