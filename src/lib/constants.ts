// ─── Meeting Status ───────────────────────────────────────────────────────────
export const MEETING_STATUS = {
  CREATED: "created",
  UPLOADED: "uploaded",
  TRANSCRIBING: "transcribing",
  SUMMARIZING: "summarizing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const

export type MeetingStatus = (typeof MEETING_STATUS)[keyof typeof MEETING_STATUS]

// ─── Processing Stage Labels ──────────────────────────────────────────────────
export const TRANSCRIPTION_STAGES = ["Uploading", "Transcribing", "Processing"] as const
export const SUMMARIZATION_STAGES = [
  "Fetching transcript",
  "Generating with AI",
  "Saving results",
] as const

// ─── Audio Constraints ────────────────────────────────────────────────────────
export const AUDIO_MAX_SIZE_MB = 50
export const AUDIO_MAX_SIZE_BYTES = AUDIO_MAX_SIZE_MB * 1024 * 1024
export const AUDIO_ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/webm", "audio/ogg"] as const
export const AUDIO_ALLOWED_EXTENSIONS = ["mp3", "wav", "m4a", "webm", "ogg"] as const
export const AUDIO_STORAGE_BUCKET = "meeting-audio"

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  NEW_MEETING: "/meetings/new",
  MEETING: (id: string) => `/meetings/${id}`,
  RECORD: (id: string) => `/meetings/${id}/record`,
  TRANSCRIPT: (id: string) => `/meetings/${id}/transcript`,
  MOM: (id: string) => `/meetings/${id}/mom`,
} as const

// ─── API Routes ───────────────────────────────────────────────────────────────
export const API_ROUTES = {
  MEETINGS: "/api/meetings",
  MEETING: (id: string) => `/api/meetings/${id}`,
  AUDIO: "/api/audio",
  TRANSCRIPTS: "/api/transcripts",
  TRANSCRIBE: "/api/transcribe",
  SUMMARIES: "/api/summaries",
  MOMS: "/api/moms",
  SUMMARIZE: "/api/summarize",
  AUTH_CALLBACK: "/api/auth/callback",
} as const

// ─── Transcript Version ───────────────────────────────────────────────────────
export const TRANSCRIPT_VERSION = {
  EDITED: "edited",
  ORIGINAL: "original",
} as const

// ─── Copy/Export Feedback ─────────────────────────────────────────────────────
export const COPY_SUCCESS_DURATION_MS = 2000
