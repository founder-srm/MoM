# MoM Generator — Project Handover Report

> Generated: July 2026  
> Purpose: Bring a new AI assistant or senior engineer fully up to speed on the current state of the project without needing to read source code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Current Folder Structure](#3-current-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Application Flow](#5-application-flow)
6. [AI Pipeline](#6-ai-pipeline)
7. [API Routes](#7-api-routes)
8. [Components](#8-components)
9. [Contexts, Hooks and Providers](#9-contexts-hooks-and-providers)
10. [Features Completed](#10-features-completed)
11. [Features In Progress](#11-features-in-progress)
12. [Remaining TODOs](#12-remaining-todos)
13. [Known Bugs](#13-known-bugs)
14. [Current Challenges](#14-current-challenges)
15. [Architectural Decisions](#15-architectural-decisions)
16. [Future Scope](#16-future-scope)
17. [Environment Variables](#17-environment-variables)
18. [Dependencies](#18-dependencies)
19. [Deployment Instructions](#19-deployment-instructions)
20. [Quick Start](#20-quick-start)

---

## 1. Project Overview

### Purpose

MoM Generator is a SaaS-style web application that automates the creation of Minutes of Meeting (MoM) documents. A user uploads or records meeting audio, the system transcribes it locally using Faster-Whisper, then sends the transcript to a local Ollama LLM (Qwen 3) which returns a structured JSON output. The frontend renders that JSON into a formatted MoM document which can be copied, printed, or exported.

The application is designed to be **zero-cost on AI** — there are no external AI API calls, no Groq, no OpenAI, no Gemini. The entire AI pipeline runs locally.

### Current Architecture

```
Browser (Next.js 16 App Router)
        │
        ├── Supabase Auth          — Session management, email/password login
        ├── Supabase PostgreSQL    — Meetings, transcripts, summaries, MoMs
        ├── Supabase Storage       — Audio file storage (meeting-audio bucket)
        │
        └── Next.js API Routes
                ├── /api/transcribe  → calls local Faster-Whisper FastAPI service
                └── /api/summarize   → calls local Ollama HTTP API (Qwen 3)
```

The frontend and the AI services are decoupled via environment variables. The Next.js app never does AI inference directly — it delegates to two local services via HTTP.

### Major Design Decisions

- **UI-first development**: All pages and UI flows were built with mock data first. The backend wiring is happening as a second phase. This means the full multi-step wizard (New Meeting → Record/Upload → Transcript → MoM) is visually complete but not yet functionally wired.
- **Local-first AI**: Chose Faster-Whisper + Ollama over hosted APIs to keep operating costs at zero and data on-premises.
- **Supabase for everything**: Auth, database, and file storage all go through Supabase to minimize infrastructure complexity.
- **Route groups**: `/(auth)` for login/signup, `/(app)` for the authenticated app shell — clean separation of layouts.

---

## 2. Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| **Framework** | Next.js | 16.2.6, App Router, RSC enabled |
| **Runtime** | Bun | Package manager + runtime (`bun.lock` present) |
| **Language** | TypeScript | ^5, strict mode |
| **UI Library** | shadcn/ui | Style: `radix-nova`, icons: `lucide-react` |
| **Styling** | Tailwind CSS | v4, `@theme inline` syntax |
| **Component Primitives** | Radix UI | via `radix-ui` ^1.4.3 |
| **Database** | Supabase PostgreSQL | 6 tables, RLS enabled |
| **Authentication** | Supabase Auth | `@supabase/ssr` + `@supabase/supabase-js` |
| **Storage** | Supabase Storage | `meeting-audio` private bucket |
| **Speech-to-Text** | Faster-Whisper | Local FastAPI service (`services/transcription`) |
| **AI / LLM** | Ollama (Qwen 3) | Local inference; Gemma or Llama as fallback |
| **State Management** | React Context | `MeetingContext` for wizard state |
| **Linter / Formatter** | Biome | 2.2.0, replaces ESLint + Prettier |
| **Toasts** | Sonner | ^2.0.7 |
| **Theming** | next-themes | ^0.4.6, dark mode default |
| **Animations** | tw-animate-css | ^1.4.0 |
| **Class Utilities** | clsx + tailwind-merge | via `cn()` helper |
| **Icons** | lucide-react | ^1.16.0 |
| **Fonts** | Inter (sans) + Instrument Serif | Loaded in root layout via `next/font` |
| **Python (STT service)** | FastAPI + uvicorn | `services/transcription` |
| **Deployment** | Not yet defined | Vercel recommended for Next.js |

---

## 3. Current Folder Structure

```
MoM/                                    ← Workspace root
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Root layout: Inter + Instrument Serif fonts, dark mode, ThemeProvider
│   │   ├── page.tsx                    ← Placeholder home page (redirect target TBD)
│   │   ├── favicon.ico
│   │   │
│   │   ├── (auth)/                     ← Auth route group — no sidebar, gradient background
│   │   │   ├── layout.tsx              ← Auth layout wrapper
│   │   │   └── login/
│   │   │       └── page.tsx            ← Combined login + signup tabs (currently uses localStorage — BUG)
│   │   │
│   │   ├── (app)/                      ← Authenticated app — has AppSidebar + MeetingProvider
│   │   │   ├── layout.tsx              ← App shell: renders AppSidebar, wraps children in MeetingProvider
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx            ← Meeting list, stats, search (currently mock data)
│   │   │   └── meetings/
│   │   │       ├── new/
│   │   │       │   └── page.tsx        ← New meeting form (navigates to hardcoded draft-1 — BUG)
│   │   │       └── [id]/
│   │   │           ├── page.tsx        ← Meeting detail: tabbed MoM/Summary (mock data, parseInt bug)
│   │   │           ├── record/
│   │   │           │   └── page.tsx    ← Record/Upload audio UI (timer-only recorder — no MediaRecorder)
│   │   │           ├── transcript/
│   │   │           │   └── page.tsx    ← Transcript review/edit (simulated progress, mock transcript)
│   │   │           └── mom/
│   │   │               └── page.tsx    ← MoM display with export actions (simulated generation)
│   │   │
│   │   └── api/
│   │       ├── audio/
│   │       │   └── route.ts            ← POST: Save audio_files record to Supabase
│   │       ├── meetings/
│   │       │   ├── route.ts            ← GET: List user meetings | POST: Create meeting
│   │       │   └── [id]/
│   │       │       └── route.ts        ← GET: Single meeting | PATCH: Update meeting
│   │       ├── moms/
│   │       │   └── route.ts            ← POST: Insert moms record
│   │       ├── summaries/
│   │       │   └── route.ts            ← POST: Insert summaries record
│   │       └── transcripts/
│   │           └── route.ts            ← POST: Insert transcript | PATCH: Update edited_text
│   │
│   ├── components/
│   │   ├── theme-provider.tsx          ← next-themes ThemeProvider re-export
│   │   ├── dashboard/
│   │   │   ├── meeting-card.tsx        ← Card: title, summary, date, participant count, status badge
│   │   │   ├── stats-cards.tsx         ← Three stat cards: Total / This Month / Completed
│   │   │   └── status-badge.tsx        ← Color-coded badge by meeting status
│   │   ├── layout/
│   │   │   └── app-sidebar.tsx         ← Dark sidebar, nav, user email (localStorage — BUG), sign out
│   │   ├── meeting/
│   │   │   ├── meeting-context.tsx     ← MeetingContext + MeetingProvider (missing meetingId — BUG)
│   │   │   └── mom-renderer.tsx        ← Renders markdown-style MoM text (font-sora — BUG)
│   │   └── ui/                         ← All shadcn/radix-nova components (do not edit manually)
│   │       └── [20 component files]
│   │
│   ├── hooks/
│   │   ├── use-audio-recorder.ts       ← Timer only, no MediaRecorder, no audioBlob (incomplete)
│   │   └── use-mobile.ts               ← matchMedia hook for responsive layout
│   │
│   ├── lib/
│   │   ├── utils.ts                    ← cn() utility (clsx + tailwind-merge)
│   │   ├── mock-data.ts                ← MOCK_MEETINGS, MOCK_TRANSCRIPT, MOCK_MOM — to be removed
│   │   ├── supabase/
│   │   │   ├── client.ts               ← createBrowserClient (for Client Components)
│   │   │   └── server.ts               ← createServerClient with cookie handling (for Server Components)
│   │   └── types/
│   │       ├── database.ts             ← Full TypeScript types for all Supabase tables
│   │       └── meeting.ts              ← MeetingForm type used by context
│   │
│   ├── styles/
│   │   ├── globals.css                 ← ACTIVE: Green-tinted theme, Tailwind v4 @theme inline
│   │   ├── globals_claude.css          ← Alternate: Claude-inspired neutral theme (shadcn config points here)
│   │   └── globals_fc.css              ← Alternate: Founders Club dark crimson theme
│   │   ⚠️  DO NOT MODIFY ANY FILE IN THIS FOLDER (AGENTS.md rule)
│   │
│   └── middleware.ts                   ← Session refresh only — NO redirect logic yet (BUG)
│
├── services/
│   └── transcription/                  ← Python FastAPI service for local Faster-Whisper STT
│       ├── app/
│       │   ├── main.py                 ← FastAPI app, /health + /transcribe routes
│       │   ├── transcriber.py          ← Singleton WhisperModel, transcribe_file()
│       │   ├── schemas.py              ← Pydantic models: TranscribeRequest/Response/Segment
│       │   ├── config.py               ← Settings dataclass (model, device, compute type, limits)
│       │   ├── audio.py                ← Async audio download to tempfile, cleanup
│       │   ├── errors.py               ← TranscriptionServiceError + FastAPI exception handlers
│       │   └── __init__.py
│       ├── requirements.txt
│       └── README.md
│
├── public/
│   ├── FCLogo.svg
│   └── FCLogoSquareCentered.svg
│
├── docs/
│   ├── HANDOVER.md                     ← This file
│   ├── MoM_Planning_Document.md
│   ├── project_planning_document.md
│   ├── extracted_planning_doc.txt
│   └── guides/
│       └── shadcn.md
│
├── .kiro/specs/mom-generator-completion/
│   └── requirements.md                 ← Full spec with 11 requirements + acceptance criteria
│
├── .agents/skills/shadcn/              ← shadcn skill rules for AI agents
├── components.json                     ← shadcn config (style: radix-nova, css: globals_claude.css)
├── biome.json                          ← Linter/formatter config
├── next.config.ts                      ← Minimal Next.js config (no customizations yet)
├── package.json
├── bun.lock
├── implementation.md                   ← Phase-by-phase implementation plan with task checklist
└── AGENTS.md                           ← Non-negotiable project rules for AI agents
```

---

## 4. Database Schema

The schema is defined in `implementation.md` and typed in `src/lib/types/database.ts`. It must be applied manually via the Supabase SQL editor. RLS is required on all tables.

### `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` | PK, references `auth.users(id)` ON DELETE CASCADE |
| `name` | `TEXT` | Display name |
| `email` | `TEXT` | Denormalized from auth |
| `created_at` | `TIMESTAMPTZ` | Default: `NOW()` |

**Purpose:** Extends Supabase's built-in `auth.users`. Created automatically via a trigger on new user signup.  
**Relationships:** One-to-many with `meetings`.

---

### `meetings`

| Column | Type | Notes |
|---|---|---|
| `meeting_id` | `UUID` | PK, default `gen_random_uuid()` |
| `user_id` | `UUID` | FK → `profiles(id)` ON DELETE CASCADE |
| `title` | `TEXT` | Required |
| `date` | `TIMESTAMPTZ` | Default: `NOW()` |
| `description` | `TEXT` | Optional agenda/description |
| `participants` | `TEXT` | Comma-separated names ⚠️ column not yet in DB type — needs migration |
| `status` | `TEXT` | CHECK: `created`, `uploaded`, `transcribing`, `summarizing`, `completed`, `failed` |
| `created_at` | `TIMESTAMPTZ` | Default: `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Default: `NOW()` |

**Purpose:** Central record for each meeting. Drives status lifecycle.  
**Relationships:** One-to-many with `audio_files`, `transcripts`, `summaries`, `moms`.  
⚠️ The `participants` column is **missing** from the current `database.ts` type definition and likely from the actual Supabase table. A migration is required.

---

### `audio_files`

| Column | Type | Notes |
|---|---|---|
| `file_id` | `UUID` | PK, default `gen_random_uuid()` |
| `meeting_id` | `UUID` | FK → `meetings(meeting_id)` ON DELETE CASCADE |
| `storage_url` | `TEXT` | Full Supabase Storage path |
| `file_name` | `TEXT` | Original filename |
| `file_size` | `BIGINT` | Bytes |
| `created_at` | `TIMESTAMPTZ` | Default: `NOW()` |

**Purpose:** Stores reference to the uploaded/recorded audio in Supabase Storage.  
**Storage path convention:** `{user_id}/{meeting_id}/audio.{ext}`

---

### `transcripts`

| Column | Type | Notes |
|---|---|---|
| `transcript_id` | `UUID` | PK, default `gen_random_uuid()` |
| `meeting_id` | `UUID` | FK → `meetings(meeting_id)` ON DELETE CASCADE |
| `transcript_text` | `TEXT` | Raw output from Faster-Whisper |
| `edited_text` | `TEXT` | Nullable — set when user edits the transcript |
| `created_at` | `TIMESTAMPTZ` | Default: `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Default: `NOW()` |

**Purpose:** Stores both the raw and user-edited transcript.  
**Key logic:** The summarization API uses `edited_text` if non-null, otherwise falls back to `transcript_text`.

---

### `summaries`

| Column | Type | Notes |
|---|---|---|
| `summary_id` | `UUID` | PK, default `gen_random_uuid()` |
| `meeting_id` | `UUID` | FK → `meetings(meeting_id)` ON DELETE CASCADE |
| `summary_text` | `TEXT` | Executive summary from Ollama (maps to `executive_summary` JSON field) |
| `created_at` | `TIMESTAMPTZ` | Default: `NOW()` |

**Purpose:** Stores the executive summary produced by the LLM.

---

### `moms`

| Column | Type | Notes |
|---|---|---|
| `mom_id` | `UUID` | PK, default `gen_random_uuid()` |
| `meeting_id` | `UUID` | FK → `meetings(meeting_id)` ON DELETE CASCADE |
| `mom_content` | `TEXT` | Full structured JSON from Ollama (see AI Pipeline section) |
| `created_at` | `TIMESTAMPTZ` | Default: `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | Default: `NOW()` |

**Purpose:** Stores the full MoM output. The `mom_content` field stores the raw JSON string. The frontend parses and renders it.

---

### Row Level Security

All tables use the same RLS pattern — users can only read/write their own data:

```sql
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meetings"   ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meetings" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meetings" ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meetings" ON meetings FOR DELETE USING (auth.uid() = user_id);
-- Repeat for audio_files, transcripts, summaries, moms (joining through meeting_id → user_id)
```

---

## 5. Application Flow

### Login

1. User visits `/login`.
2. The page renders a tabbed card with "Login" and "Sign Up" tabs.
3. **Current (buggy) state:** On submit, the email is saved to `localStorage` and the user is redirected manually — no real Supabase session is created.
4. **Target state:** Call `supabase.auth.signInWithPassword({ email, password })`. On success, redirect to `/dashboard`. On failure, show inline error. Loading state disables the submit button.
5. For OAuth/email confirmation, `/api/auth/callback` exchanges the `code` param for a session via `supabase.auth.exchangeCodeForSession`.
6. Middleware will redirect authenticated users away from `/login` to `/dashboard`.

---

### Dashboard

1. After login, user lands at `/dashboard`.
2. `GET /api/meetings` fetches all meetings for the authenticated user ordered by `created_at DESC`.
3. Meetings render as cards showing title, date, summary snippet, participant count, and status badge.
4. Three stat cards at the top show: Total Meetings / This Month / Completed.
5. A search input filters the visible list client-side by title.
6. If no meetings exist, an empty state with a "Create your first meeting" CTA is shown.
7. Clicking a card navigates to `/meetings/{meeting_id}`.

---

### New Meeting

1. User clicks "New Meeting" in sidebar or empty-state CTA.
2. `/meetings/new` renders a form with: Title, Date, Participants (comma-separated), and Agenda/Description.
3. On submit, `POST /api/meetings` is called with form data.
4. On success, the returned `meeting_id` UUID is stored in `MeetingContext` and the user navigates to `/meetings/{meeting_id}/record`.
5. On failure, an inline error is shown and navigation is blocked.

---

### Audio (Record or Upload)

1. User is on `/meetings/{meeting_id}/record`.
2. Two tabs: **Record Live** and **Upload File**.
3. **Record Live:** `useAudioRecorder` hook calls `navigator.mediaDevices.getUserMedia({ audio: true })`, starts a `MediaRecorder`, collects chunks at ≤1000ms intervals. On stop, `audioBlob` is set to a `Blob` of type `audio/webm`.
4. **Upload File:** Drag-and-drop or file picker. Validates MIME type (mp3/wav/m4a/webm/ogg) and size (≤50MB).
5. Clicking "Process Audio" uploads the blob/file to Supabase Storage at `{user_id}/{meeting_id}/audio.{ext}` with a progress indicator (0–100%).
6. On upload success, `POST /api/audio` saves the `storage_url` and file metadata to `audio_files`.
7. Navigation continues to `/meetings/{meeting_id}/transcript`.

---

### Transcript

1. User lands on `/meetings/{meeting_id}/transcript`.
2. The page immediately calls `POST /api/transcribe` with `{ meeting_id }`.
3. A progress indicator cycles through "Uploading → Transcribing → Processing".
4. The transcription API downloads the audio from Supabase Storage, POSTs it to the local Faster-Whisper FastAPI service (`TRANSCRIPTION_SERVICE_URL`), and receives `{ text, language, segments }`.
5. The transcript text is upserted into the `transcripts` table. Meeting status updates to `"transcribed"`.
6. The transcript text appears in an editable `Textarea`.
7. User can correct the transcript freely.
8. Clicking "Generate MoM" calls `PATCH /api/transcripts` with `{ meeting_id, edited_text }` to save edits.
9. On save success, navigation continues to `/meetings/{meeting_id}/mom`.

---

### AI Processing (MoM Generation)

1. User lands on `/meetings/{meeting_id}/mom`.
2. The page calls `POST /api/summarize` with `{ meeting_id }`.
3. A progress indicator shows: "Fetching transcript → Generating with AI → Saving results".
4. The summarization API:
   - Fetches the transcript (prefers `edited_text`, falls back to `transcript_text`).
   - Fetches meeting metadata (title, date, participants).
   - Sends a structured prompt to `OLLAMA_BASE_URL` using the Qwen 3 model.
   - Receives a JSON response with 7 fields (see AI Pipeline section).
   - Upserts the JSON to `moms`, the executive summary to `summaries`, updates meeting status to `"completed"`.
5. Returns `{ ...structuredJson, transcript_version: "edited" | "original" }` with HTTP 200.

---

### MoM View

1. The `MomRenderer` component parses the JSON and renders each field as a formatted section.
2. Three export buttons are always visible: **Copy as Markdown**, **Copy MoM** (plain text), **Print / Save as PDF**.
3. Clicking "Save to Archive" navigates to `/dashboard` (no additional API call needed — MoM was already persisted during generation).

---

### Archive / Meeting Detail

1. From the dashboard, clicking any past meeting navigates to `/meetings/{meeting_id}`.
2. The meeting detail page loads the MoM and summary from Supabase and displays them in a tabbed view.
3. If MoM/summary are not yet generated, placeholder text is shown.
4. If the meeting does not exist, a "Meeting not found" message with a dashboard link is shown.

---

## 6. AI Pipeline

### Overview

The AI pipeline is **fully local** — no external API calls, no usage costs, no data leaving the machine.

```
Audio File (Supabase Storage)
        │
        ▼
POST /api/transcribe (Next.js API route)
        │  Downloads audio, POSTs to local service
        ▼
Faster-Whisper FastAPI Service  (services/transcription)
        │  Returns: { text, language, segments }
        ▼
Transcript saved to Supabase (transcripts table)
        │
        ▼  (after user review / edit)
        │
POST /api/summarize (Next.js API route)
        │  Builds prompt, calls Ollama HTTP API
        ▼
Ollama Local Server  (http://localhost:11434 by default)
  Model: Qwen 3  (fallback: Gemma, Llama)
        │  Returns: structured JSON
        ▼
JSON parsed and saved to Supabase (moms + summaries tables)
        │
        ▼
Frontend renders JSON → Markdown display → PDF/DOCX export
```

---

### Speech-to-Text: Faster-Whisper

- **Service location:** `services/transcription/` (Python FastAPI)
- **Model:** Configurable via `TRANSCRIPTION_MODEL` env var (default: `small`)
- **Device:** Configurable via `TRANSCRIPTION_DEVICE` (default: `cpu`)
- **Compute type:** Configurable via `TRANSCRIPTION_COMPUTE_TYPE` (default: `int8`)
- **Endpoint called by Next.js:** `POST {TRANSCRIPTION_SERVICE_URL}/transcribe`
- **Request body:**

```json
{
  "audio_url": "https://supabase-storage-url/path/to/audio.webm",
  "meeting_id": "uuid-string",
  "audio_file_id": "uuid-string"
}
```

- **Response:**

```json
{
  "text": "Full transcript as a single string...",
  "language": "en",
  "segments": [
    { "start": 0.0, "end": 3.5, "text": "Alright everyone, let's get started." }
  ]
}
```

- **Health check:** `GET {TRANSCRIPTION_SERVICE_URL}/health` → `{"status": "ok", "service": "transcription"}`
- **Audio limits:** Max `MAX_AUDIO_MB` (default 100MB), download timeout `AUDIO_DOWNLOAD_TIMEOUT_SECONDS` (default 60s)
- **The service starts the Whisper model on startup** via lifespan event — cold start may be slow depending on model size.

---

### LLM: Ollama (Qwen 3)

- **Service:** Local Ollama instance at `OLLAMA_BASE_URL` (default: `http://localhost:11434`)
- **Primary model:** `qwen3` (or the current Qwen 3 tag on Ollama hub)
- **Fallback models:** `gemma` or `llama3` if Qwen 3 is unavailable
- **Called by:** `POST /api/summarize` (Next.js API route) via `src/lib/ollama.ts` helper

#### Prompt Structure

The summarization API sends a single prompt along these lines:

```
You are a professional meeting minutes assistant.
Given the following meeting transcript and metadata, generate a structured JSON response.

Meeting Title: {title}
Date: {date}
Participants: {participants}

Transcript:
{transcript_text}

Return ONLY valid JSON with exactly these fields:
{
  "executive_summary": "...",
  "meeting_summary": "...",
  "highlights": ["...", "..."],
  "decisions": ["...", "..."],
  "action_items": [
    { "owner": "...", "task": "...", "deadline": "..." }
  ],
  "risks": ["...", "..."],
  "sop": "..."
}
```

#### JSON Output Structure

```typescript
interface MoMJson {
  executive_summary: string;       // 2-3 sentence high-level summary
  meeting_summary: string;         // Full narrative summary of the discussion
  highlights: string[];            // Key points / notable moments
  decisions: string[];             // Decisions that were made
  action_items: {
    owner: string;
    task: string;
    deadline: string;
  }[];
  risks: string[];                 // Risks or blockers identified
  sop: string;                     // Standard operating procedures or next steps
}
```

This JSON is stored verbatim as `mom_content` in the `moms` table (TEXT column). The frontend parses it and renders each field.

---

### Frontend Rendering

`MomRenderer` receives the parsed `MoMJson` object and renders:

| JSON Field | Rendered As |
|---|---|
| `executive_summary` | Highlighted card at the top of the document |
| `meeting_summary` | Prose paragraph section |
| `highlights` | Bullet list |
| `decisions` | Numbered list |
| `action_items` | Markdown-style table: Owner / Task / Deadline |
| `risks` | Bullet list with warning styling |
| `sop` | Prose paragraph or numbered steps |

---

### Export Flow

| Action | Mechanism |
|---|---|
| Copy as Markdown | Reconstructs Markdown string from JSON fields, writes to clipboard |
| Copy as plain text | Strips all Markdown syntax from the reconstructed string, writes to clipboard |
| Print / Save as PDF | Calls `window.print()` — browser handles PDF export |

---

## 7. API Routes

### Existing CRUD Routes (implemented, wired to Supabase)

---

#### `GET /api/meetings`

| | |
|---|---|
| **Method** | GET |
| **Auth** | Required (reads `user_id` from Supabase session) |
| **Request** | None |
| **Response** | `{ data: Meeting[] }` ordered by `created_at DESC` |
| **Purpose** | Fetch all meetings for the authenticated user |
| **File** | `src/app/api/meetings/route.ts` |

---

#### `POST /api/meetings`

| | |
|---|---|
| **Method** | POST |
| **Auth** | Required |
| **Request body** | `{ title: string, date: string, participants: string, description?: string }` |
| **Response** | `{ data: Meeting }` with the created record including `meeting_id` UUID |
| **Purpose** | Create a new meeting record |
| **File** | `src/app/api/meetings/route.ts` |
| ⚠️ **Bug** | Currently inserts `status: "processing"` — should be `"created"` |

---

#### `GET /api/meetings/[id]`

| | |
|---|---|
| **Method** | GET |
| **Auth** | Required |
| **Request** | `id` from URL params (UUID string) |
| **Response** | `{ data: Meeting }` |
| **Purpose** | Fetch a single meeting by UUID |
| **File** | `src/app/api/meetings/[id]/route.ts` |

---

#### `PATCH /api/meetings/[id]`

| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Required |
| **Request body** | `{ title?, date?, description?, status? }` (all optional) |
| **Response** | `{ data: Meeting }` with updated record |
| **Purpose** | Update meeting metadata or status |
| **File** | `src/app/api/meetings/[id]/route.ts` |

---

#### `POST /api/audio`

| | |
|---|---|
| **Method** | POST |
| **Auth** | Required |
| **Request body** | `{ meeting_id: string, storage_url: string, file_name?: string, file_size?: number }` |
| **Response** | `{ data: AudioFile }` |
| **Purpose** | Save audio file metadata after Supabase Storage upload |
| **File** | `src/app/api/audio/route.ts` |

---

#### `POST /api/transcripts`

| | |
|---|---|
| **Method** | POST |
| **Auth** | Required |
| **Request body** | `{ meeting_id: string, transcript_text: string }` |
| **Response** | `{ data: Transcript }` |
| **Purpose** | Insert a new transcript record |
| **File** | `src/app/api/transcripts/route.ts` |

---

#### `PATCH /api/transcripts`

| | |
|---|---|
| **Method** | PATCH |
| **Auth** | Required |
| **Request body** | `{ meeting_id: string, edited_text: string }` |
| **Response** | `{ data: Transcript }` |
| **Purpose** | Save user-edited transcript text |
| **File** | `src/app/api/transcripts/route.ts` |
| ⚠️ **Bug** | Currently expects `transcript_id` as key — must be changed to look up by `meeting_id` |

---

#### `POST /api/summaries`

| | |
|---|---|
| **Method** | POST |
| **Auth** | Required |
| **Request body** | `{ meeting_id: string, summary_text: string }` |
| **Response** | `{ data: Summary }` |
| **Purpose** | Save executive summary to the summaries table |
| **File** | `src/app/api/summaries/route.ts` |

---

#### `POST /api/moms`

| | |
|---|---|
| **Method** | POST |
| **Auth** | Required |
| **Request body** | `{ meeting_id: string, mom_content: string }` |
| **Response** | `{ data: MoM }` |
| **Purpose** | Save MoM content (JSON string) to the moms table |
| **File** | `src/app/api/moms/route.ts` |

---

### Routes Not Yet Created (required)

| Route | Method | Purpose |
|---|---|---|
| `/api/transcribe` | POST | Orchestrates STT: downloads audio, calls Faster-Whisper, saves to DB |
| `/api/summarize` | POST | Orchestrates LLM: fetches transcript, calls Ollama, saves to DB |
| `/api/auth/callback` | GET | Exchanges Supabase auth `code` param for a session |

---

## 8. Components

### Page-level Components

| Component | Location | Type | Description |
|---|---|---|---|
| Root Layout | `src/app/layout.tsx` | Server | Loads fonts (Inter, Instrument Serif), sets `className="dark"`, wraps with `ThemeProvider` |
| Auth Layout | `src/app/(auth)/layout.tsx` | Server | Gradient background wrapper for login/signup pages |
| App Layout | `src/app/(app)/layout.tsx` | Client | Renders `AppSidebar` + `MeetingProvider`. Uses `font-sora` (⚠️ bug — should be `font-sans`) |
| Login Page | `src/app/(auth)/login/page.tsx` | Client | Tabs: Login / Sign Up. Currently uses `localStorage` instead of Supabase Auth (⚠️ bug) |
| Dashboard Page | `src/app/(app)/dashboard/page.tsx` | Client | Stat cards + search + meeting list. Uses `MOCK_MEETINGS` (⚠️ not wired to Supabase) |
| New Meeting Page | `src/app/(app)/meetings/new/page.tsx` | Client | Form: title, date, participants, agenda. Navigates to hardcoded `draft-1` (⚠️ bug) |
| Meeting Detail Page | `src/app/(app)/meetings/[id]/page.tsx` | Client | Tabbed MoM/Summary view. Uses `parseInt(params.id)` (⚠️ UUID bug) + mock data |
| Record Page | `src/app/(app)/meetings/[id]/record/page.tsx` | Client | Record/Upload tabs. `useAudioRecorder` is timer-only (⚠️ no real MediaRecorder) |
| Transcript Page | `src/app/(app)/meetings/[id]/transcript/page.tsx` | Client | Simulated progress + `MOCK_TRANSCRIPT` in editable Textarea |
| MoM Page | `src/app/(app)/meetings/[id]/mom/page.tsx` | Client | Simulated generation progress + export buttons + `MomRenderer` with `MOCK_MOM` |

---

### Dashboard Components

#### `src/components/dashboard/meeting-card.tsx`
Renders a single meeting as a shadcn `Card`. Displays:
- Meeting title (truncated)
- Summary snippet (2 lines, truncated)
- Formatted date
- Participant count (from comma-split of `participants` string)
- `StatusBadge`
- Click handler navigates to `/meetings/{meeting_id}`

#### `src/components/dashboard/stats-cards.tsx`
Three `Card` components in a grid row, each showing a count:
- Total Meetings
- This Month
- Completed
Receives counts as props — no internal data fetching.

#### `src/components/dashboard/status-badge.tsx`
A `Badge` variant-mapped by status string:
- `completed` → emerald green
- `processing`, `transcribing`, `summarizing` → amber with pulse animation
- `failed` → red destructive
- anything else → slate outline

---

### Layout Components

#### `src/components/layout/app-sidebar.tsx`
Dark sidebar (`bg-slate-950`). Contains:
- App name / logo area
- Nav items: Dashboard, New Meeting (with Lucide icons)
- User email at the bottom — currently reads from `localStorage.getItem("userEmail")` (⚠️ bug — should call `supabase.auth.getUser()`)
- Theme toggle (dark/light)
- Sign out button — currently clears `localStorage` and redirects manually (⚠️ bug — should call `supabase.auth.signOut()`)
- Uses `font-sora` class (⚠️ bug — should be `font-sans`)

---

### Meeting Components

#### `src/components/meeting/meeting-context.tsx`
Provides global wizard state across the multi-step meeting flow. Exports:
- `MeetingProvider` — wraps the `/(app)` layout
- `useMeetingFlow()` — hook to access context

Current context shape:
```typescript
{
  meetingForm: MeetingForm;       // Form data (title, date, participants, etc.)
  setMeetingForm: (form) => void;
  meetingData: any;               // Fetched meeting data
  setMeetingData: (data) => void;
  // ⚠️ MISSING: meetingId: string | null — must be added
}
```

#### `src/components/meeting/mom-renderer.tsx`
Client component that renders the MoM content. Currently accepts a raw markdown-like string and parses it manually:
- `---` → `<hr>` dividers
- `| ` prefix → table rows
- `**bold:**` pattern → bold labels
- inline `**text**` → `<strong>`

⚠️ Uses `font-sora` class (bug — should be `font-sans`).  
⚠️ Will need to be updated to accept the `MoMJson` object structure instead of a raw string once Ollama integration is complete.

---

### UI Components (`src/components/ui/`)

All are standard shadcn/radix-nova components. Do not edit these manually — use `bunx --bun shadcn@latest` to add or update them.

| Component | Notes |
|---|---|
| `alert.tsx` | Error/info alert banners |
| `avatar.tsx` | User avatar with fallback initials |
| `badge.tsx` | Status and label badges |
| `button.tsx` | Primary, secondary, ghost, destructive variants |
| `card.tsx` | Container card with header/content/footer |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus (used in sidebar user menu) |
| `input.tsx` | Text inputs |
| `progress.tsx` | Progress bar (used in upload/processing states) |
| `scroll-area.tsx` | Scrollable containers with custom scrollbars |
| `separator.tsx` | Horizontal/vertical dividers |
| `sheet.tsx` | Slide-over panels (mobile sidebar) |
| `sidebar.tsx` | Full sidebar primitive |
| `skeleton.tsx` | Loading skeleton blocks |
| `sonner.tsx` | Toast notification integration |
| `tabs.tsx` | Tabbed content panels |
| `textarea.tsx` | Multi-line text input |
| `theme-toggle.tsx` | Dark/light mode toggle button |
| `tooltip.tsx` | Hover tooltips |

---

## 9. Contexts, Hooks and Providers

### Contexts

#### `MeetingContext` (`src/components/meeting/meeting-context.tsx`)

The only application-level context. It holds all in-flight state for the multi-step meeting creation wizard so data flows across page navigations without additional DB calls.

**Current shape (incomplete):**
```typescript
type MeetingContextType = {
  meetingForm: MeetingForm;              // Form data entered on the New Meeting page
  setMeetingForm: (form: MeetingForm) => void;
  meetingData: any;                      // Fetched meeting data (loosely typed)
  setMeetingData: (data: any) => void;
  // ⚠️ meetingId: string | null;        // MISSING — must be added for UUID propagation
}
```

**Target shape (after fix):**
```typescript
type MeetingContextType = {
  meetingForm: MeetingForm;
  setMeetingForm: (form: MeetingForm) => void;
  meetingData: any;
  setMeetingData: (data: any) => void;
  meetingId: string | null;              // Real UUID from Supabase, set after meeting creation
  setMeetingId: (id: string | null) => void;
}
```

**Where it's consumed:**
- `new/page.tsx` — sets `meetingId` after successful `POST /api/meetings`
- `record/page.tsx` — reads `meetingId` to construct the Storage path and navigation target
- `transcript/page.tsx` — reads `meetingId` for API call and back navigation
- `mom/page.tsx` — reads `meetingId` for API call and back navigation

---

### Custom Hooks

#### `useAudioRecorder` (`src/hooks/use-audio-recorder.ts`)

**Current (incomplete) implementation:**
```typescript
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  function startRecording() {
    setIsRecording(true);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }

  function stopRecording() {
    clearInterval(timerRef.current!);
    setIsRecording(false);
  }

  return { isRecording, elapsed, startRecording, stopRecording };
  // ⚠️ Missing: audioBlob, MediaRecorder integration
}
```

**Target implementation must add:**
- `navigator.mediaDevices.getUserMedia({ audio: true })` for mic access
- A `MediaRecorder` instance that collects chunks at ≤1000ms intervals
- `audioBlob: Blob | null` — null until recording stops, then set to the collected audio
- Permission error handling (`NotAllowedError`, `NotFoundError`)
- `MediaRecorder` availability feature detection

#### `useIsMobile` (`src/hooks/use-mobile.ts`)

Simple hook using `matchMedia` and `window.innerWidth < 768`. Used by the sidebar component to collapse on mobile.

```typescript
export function useIsMobile(): boolean
```

---

### Providers

#### `ThemeProvider` (`src/components/theme-provider.tsx`)
Re-exports `next-themes`'s `ThemeProvider`. Wraps the entire app in the root layout. Configured with `attribute="class"` and `defaultTheme="dark"`.

#### `MeetingProvider` (`src/components/meeting/meeting-context.tsx`)
Wraps the `/(app)` layout (`src/app/(app)/layout.tsx`). Persists wizard state across the New Meeting → Record → Transcript → MoM navigation.

---

### Global State Summary

| State | Where Stored | Scope |
|---|---|---|
| Auth session | Supabase SSR cookies | Server + Client (via middleware) |
| Theme (dark/light) | `next-themes` (class on `<html>`) | Global |
| Meeting wizard state | `MeetingContext` | `/(app)` subtree |
| Toast notifications | `Sonner` (imperative) | Global |
| All other state | Local `useState` per page | Per page |

There is no Redux, Zustand, Jotai, or any other third-party state manager. Keep it that way unless complexity demands it.

---

## 10. Features Completed

> Completed means: built, visually correct, and functionally working (not just UI mocked).

- ✅ Project scaffolding — Next.js 16, Bun, TypeScript, Tailwind v4, Biome
- ✅ shadcn/ui configured (radix-nova style, all required components installed)
- ✅ Dark mode — default dark, `next-themes` toggle working
- ✅ Font loading — Inter (sans) + Instrument Serif (serif) via `next/font`
- ✅ Route group layout separation — `/(auth)` and `/(app)` groups with distinct layouts
- ✅ Auth page UI — Login + Signup tabs, form fields, loading state UI (not wired to Supabase yet)
- ✅ App sidebar — navigation, user section, theme toggle, sign out button (UI only)
- ✅ Dashboard UI — stat cards, meeting card grid, search input, empty state
- ✅ New Meeting form UI — all fields present and validated on the frontend
- ✅ Record/Upload UI — tab switcher, record button with timer, drag-and-drop upload zone
- ✅ Transcript page UI — progress indicator, editable textarea, action buttons
- ✅ MoM page UI — progress indicator, rendered MoM, export buttons (Copy MD / Copy Text / Print)
- ✅ Meeting detail page UI — tabbed MoM + Summary view
- ✅ `MomRenderer` component — parses and renders markdown-like MoM content
- ✅ `StatusBadge` component — color-coded, animated for in-progress states
- ✅ Supabase client setup — `client.ts` (browser) + `server.ts` (server/SSR) correctly configured
- ✅ Supabase TypeScript types — `database.ts` typed for all 6 tables
- ✅ All CRUD API routes — `meetings`, `audio`, `transcripts`, `summaries`, `moms`
- ✅ Middleware scaffold — session refresh on every request
- ✅ Faster-Whisper Python service — fully implemented at `services/transcription/`
- ✅ Biome configured — linting + formatting rules set

---

## 11. Features In Progress

- 🔄 Authentication wiring — UI exists, Supabase calls not yet wired
- 🔄 Dashboard data fetching — calls `MOCK_MEETINGS`, needs to call `GET /api/meetings`
- 🔄 `useAudioRecorder` — timer built, `MediaRecorder` integration pending
- 🔄 Audio upload to Supabase Storage — UI exists, upload logic not implemented
- 🔄 `MeetingContext` UUID propagation — context exists, `meetingId` field not added yet
- 🔄 Navigation hardcoding removal — all wizard pages still use `draft-1`
- 🔄 `MomRenderer` JSON support — currently parses raw string, needs to accept `MoMJson` object

---

## 12. Remaining TODOs

Listed in priority order (roughly matching the 6 implementation phases):

### Phase 1 — Auth & Infrastructure
- [ ] Create `.env.local` from `.env.local.example` and fill in Supabase credentials
- [ ] Run Supabase SQL migrations (from `implementation.md` Section 5)
- [ ] Add `participants` column to `meetings` table via migration
- [ ] Enable RLS on all tables and create policies
- [ ] Create `meeting-audio` Storage bucket (private, 50MB limit)
- [ ] Wire login/signup to `supabase.auth.signInWithPassword` / `supabase.auth.signUp`
- [ ] Replace `localStorage` auth with Supabase session in `login/page.tsx`
- [ ] Create `/api/auth/callback/route.ts`
- [ ] Add redirect logic to `src/middleware.ts` (unauth → `/login`, auth + login page → `/dashboard`)
- [ ] Wire sign out to `supabase.auth.signOut()` in `app-sidebar.tsx`
- [ ] Fix sidebar user email — replace `localStorage` with `supabase.auth.getUser()`
- [ ] Replace `TRANSCRIPTION_SERVICE_URL` and `OLLAMA_BASE_URL` in `.env.local.example`

### Phase 2 — Meeting CRUD
- [ ] Wire Dashboard `page.tsx` to `GET /api/meetings` (remove `MOCK_MEETINGS`)
- [ ] Add `meetingId: string | null` + `setMeetingId` to `MeetingContext`
- [ ] Wire new meeting form to `POST /api/meetings`, store returned UUID in context
- [ ] Fix `new/page.tsx` navigation — use `meetingId` from context instead of `draft-1`
- [ ] Fix meeting detail `page.tsx` — remove `parseInt(params.id)`, use UUID string
- [ ] Fix `POST /api/meetings` — change `status: "processing"` to `status: "created"`

### Phase 3 — Audio
- [ ] Implement real `MediaRecorder` in `useAudioRecorder` — mic permission, chunks, `audioBlob`
- [ ] Implement Supabase Storage upload in `record/page.tsx` with progress indicator
- [ ] Call `POST /api/audio` after upload completes
- [ ] Add file validation (type + size) for uploaded files
- [ ] Fix back-navigation in transcript and MoM pages to use `meetingId` from context

### Phase 4 — Transcription
- [ ] Create `src/lib/transcription.ts` — HTTP helper for Faster-Whisper service, throws if `TRANSCRIPTION_SERVICE_URL` missing
- [ ] Create `src/app/api/transcribe/route.ts`
  - Validate `meeting_id`
  - Fetch audio URL from `audio_files`
  - POST to Faster-Whisper service with 60s timeout
  - Upsert result to `transcripts`, update meeting status
- [ ] Wire transcript `page.tsx` to call `POST /api/transcribe` on load (remove mock)
- [ ] Fix `PATCH /api/transcripts` to look up by `meeting_id` not `transcript_id`

### Phase 5 — AI Summary
- [ ] Create `src/lib/ollama.ts` — HTTP helper for Ollama, throws if `OLLAMA_BASE_URL` missing
- [ ] Create `src/app/api/summarize/route.ts`
  - Validate `meeting_id`
  - Fetch transcript (edited > original)
  - Build structured prompt, call Ollama (Qwen 3)
  - Parse JSON response, upsert to `moms` + `summaries`, update status
- [ ] Update `MomRenderer` to accept `MoMJson` object and render each field
- [ ] Wire MoM `page.tsx` to call `POST /api/summarize` on load (remove mock)

### Phase 6 — Polish
- [ ] Fix `font-sora` → `font-sans` in `app-sidebar.tsx`, `(app)/layout.tsx`, `mom-renderer.tsx`
- [ ] Remove `src/lib/mock-data.ts` (after all pages are wired to real data)
- [ ] Implement export: Copy as Markdown, Copy as plain text (strip syntax), Print
- [ ] Resolve CSS file inconsistency (`components.json` → `globals_claude.css`, `layout.tsx` imports `globals.css`)
- [ ] Add Sonner toasts for: meeting created, audio uploaded, transcription complete, MoM generated, errors
- [ ] Loading skeletons on dashboard while fetching meetings
- [ ] "Meeting not found" error state on `/meetings/[id]`

---

## 13. Known Bugs

| # | Bug | Location | Symptom | Fix |
|---|---|---|---|---|
| B1 | Auth uses `localStorage` instead of Supabase | `login/page.tsx`, `app-sidebar.tsx` | No real session created; refreshing the page logs out the user | Replace with `supabase.auth.signInWithPassword` / `signUp` / `signOut` / `getUser()` |
| B2 | Middleware does not redirect unauthenticated users | `src/middleware.ts` | Any URL is accessible without being logged in | Add `getUser()` check + `NextResponse.redirect` for protected paths |
| B3 | `MeetingContext` has no `meetingId` field | `meeting-context.tsx` | UUID cannot propagate through wizard; all wizard pages use hardcoded `draft-1` | Add `meetingId: string \| null` + setter to context |
| B4 | All wizard pages hardcode `/meetings/draft-1/` | `new/`, `record/`, `transcript/`, `mom/` pages | Navigates to wrong/non-existent route | Read `meetingId` from context and interpolate |
| B5 | `parseInt(params.id)` on UUID route param | `meetings/[id]/page.tsx` | `parseInt("uuid-string")` returns `NaN`, Supabase query fails silently | Use `params.id` as string directly |
| B6 | `POST /api/meetings` sets `status: "processing"` | `src/app/api/meetings/route.ts` | Incorrect initial status; breaks status lifecycle | Change to `status: "created"` |
| B7 | `PATCH /api/transcripts` expects `transcript_id` | `src/app/api/transcripts/route.ts` | Client has `meeting_id` not `transcript_id`; PATCH fails | Change lookup key to `meeting_id` |
| B8 | `font-sora` class in 3 files, Sora font never loaded | `app-sidebar.tsx`, `(app)/layout.tsx`, `mom-renderer.tsx` | Font falls back silently; may cause FOUT or inconsistency | Replace with `font-sans` (Inter) |
| B9 | Dashboard renders `MOCK_MEETINGS` | `dashboard/page.tsx` | Real meetings never shown | Wire to `GET /api/meetings` |
| B10 | `useAudioRecorder` has no `audioBlob` or `MediaRecorder` | `hooks/use-audio-recorder.ts` | "Record" button counts up but captures no audio | Implement `getUserMedia` + `MediaRecorder` + `audioBlob` |
| B11 | `meetings` DB type missing `participants` column | `src/lib/types/database.ts` | TypeScript error when inserting participants | Add column to Supabase table + update type definition |
| B12 | `components.json` and `layout.tsx` point to different CSS files | `components.json` → `globals_claude.css`, `layout.tsx` → `globals.css` | shadcn CLI and the app use different design tokens | Decide on one file; update the other reference |

---

## 14. Current Challenges

**1. UUID propagation through the multi-step wizard**  
The wizard spans 4 pages (`new → record → transcript → mom`). The `meeting_id` must be created on the first page and survive across all subsequent navigations. The current `MeetingContext` does not store it. This is the single biggest structural issue — almost everything else in Phase 2–5 depends on fixing this first.

**2. Faster-Whisper cold start time**  
When the Python service starts, it loads the Whisper model into memory. With the `small` model on CPU, this can take 10–30 seconds. Users who hit the transcript page before the service is ready will get a confusing error. A health check + retry loop or a startup probe is needed.

**3. Ollama response reliability**  
Local LLMs sometimes return malformed JSON, especially with larger inputs. The `POST /api/summarize` route must defensively parse the response and handle partial or non-JSON output gracefully. Consider prompting with explicit JSON schema instructions and validating the output with Zod.

**4. CSS file inconsistency**  
`components.json` tells the shadcn CLI to use `globals_claude.css` as the CSS source, but `app/layout.tsx` imports `globals.css`. When new shadcn components are added via CLI, their tokens are injected into `globals_claude.css` but the app reads `globals.css`. This means newly added components may have unstyled or incorrectly styled variables. This must be resolved before adding more components.

**5. Supabase Storage not yet set up**  
The `meeting-audio` bucket must be created in the Supabase dashboard and the correct storage policies applied before any audio upload can succeed. This is a manual step that depends on the user having a live Supabase project.

**6. Missing `/api/transcribe` and `/api/summarize` routes**  
The two most critical API routes don't exist yet. The transcript and MoM pages both simulate progress with timeouts and then show mock data. These two routes are the entire backend of the application.

---

## 15. Architectural Decisions

### Why Next.js 16 (App Router)?

Next.js 16 with the App Router enables a clean split between server and client rendering. API routes live alongside the UI in the same codebase, eliminating the need for a separate backend service for the database layer. Supabase clients run server-side in API routes and middleware without exposing keys to the browser. The App Router's route groups (`/(auth)`, `/(app)`) allow completely different layouts per section without any routing gymnastics.

---

### Why Bun?

The project was initialized with Bun as the package manager (`bun.lock` is present). Bun is significantly faster than npm for installs. All package operations must use `bun add` — mixing package managers corrupts the lockfile.

---

### Why Supabase?

Supabase provides auth, PostgreSQL, and file storage in a single platform with a generous free tier. This eliminates the need to run a separate auth service, a separate database, and a separate object store. The `@supabase/ssr` package handles cookie-based sessions correctly in Next.js App Router without custom token management. RLS policies enforce data ownership at the database level — even if an API route has a bug, users cannot read other users' data.

---

### Why Faster-Whisper (local) instead of Groq or OpenAI Whisper?

The original planning document suggested Groq's free-tier Whisper API. The architecture was updated to Faster-Whisper because:
- **Zero ongoing cost** — no API limits, no rate throttling, no per-minute charges
- **Data privacy** — meeting audio never leaves the machine
- **Python service already implemented** — `services/transcription/` is complete and working

The tradeoff is that the user must run the Python service locally and it requires more RAM and CPU than a pure API call. The service is configurable for GPU acceleration when available.

---

### Why Ollama (local) instead of Groq LLM?

Same rationale as Faster-Whisper. The original plan used Groq's `llama-3.3-70b-versatile`. Switched to Ollama because:
- **Zero cost** — unlimited local inference
- **Data privacy** — transcript and meeting data never leaves the machine
- **Model flexibility** — Qwen 3 is the default but any Ollama-compatible model works
- **Future-proof** — when cloud hosting is needed, only the `OLLAMA_BASE_URL` env var changes; no code changes required

The tradeoff is that Ollama must be installed and a model must be pulled before first use.

---

### Why Qwen 3 as the preferred LLM?

Qwen 3 (Alibaba) performs strongly on structured output generation tasks and follows JSON formatting instructions reliably. It fits well within the RAM constraints of a modern laptop. Gemma (Google) and Llama (Meta) are listed as fallbacks because they are broadly available on Ollama and familiar to most developers.

---

### Why structured JSON output from the LLM instead of Markdown directly?

The original design had the LLM return a Markdown-formatted MoM document directly. Changed to structured JSON because:
- **Frontend control** — the frontend can render each section with its own styling, layout, and interactivity
- **Export flexibility** — Markdown, plain text, PDF, and future formats (DOCX, HTML) can all be generated from the same JSON without re-running the LLM
- **Parseability** — JSON is easier to validate, diff, and update than free-form Markdown
- **Field-level editing** — future versions can allow the user to edit individual fields (e.g., just the action items) without touching the rest of the document

The JSON is stored as a TEXT column (`mom_content`) in the `moms` table. It is parsed by the frontend at render time.

---

### Why shadcn/ui?

Non-negotiable per `AGENTS.md` — it's a project rule. Beyond that: shadcn provides accessible, unstyled-by-default components that integrate cleanly with Tailwind CSS v4 and the radix-nova design system. Every component is owned by the project (copied into `src/components/ui/`) so there are no upstream dependency surprises.

---

### Why Biome instead of ESLint + Prettier?

Biome is a single tool that handles both linting and formatting, is significantly faster than the ESLint + Prettier combination, and produces no conflicts between the two tools' rules. It was configured from the start and should be kept — do not introduce ESLint or Prettier.

---

### Why is the UI built with mock data first?

This was a deliberate choice to get all pages and transitions visually correct before connecting to real services. The entire multi-step wizard (New Meeting → Record → Transcript → MoM) can be walked through today without any backend, making it easy to demo and review the UX. The downside is that all the mock data must now be stripped out — which is the current main task.

---

## 16. Future Scope

### Cloud Migration of the AI Pipeline

The local-first design is intentional but not permanent. When the app needs to serve multiple users concurrently, the pipeline can be moved to the cloud without touching Next.js or Supabase:

1. **Faster-Whisper → Cloud VM**: Deploy `services/transcription/` to AWS EC2, GCP Compute Engine, or any GPU-capable container service. Update `TRANSCRIPTION_SERVICE_URL` to the new endpoint. Zero code changes.

2. **Ollama → Cloud Inference**: Deploy an Ollama instance (or vLLM with an Ollama-compatible API) on a cloud GPU instance. Update `OLLAMA_BASE_URL`. Zero code changes.

3. **API Gateway**: Wrap both services behind an API gateway with token auth and per-user rate limiting before exposing them to the internet.

---

### Speaker Diarization

Faster-Whisper returns segments with timestamps but not speaker labels. Adding speaker diarization (e.g., via `pyannote.audio`) would allow action items to be automatically attributed to the correct person.

---

### DOCX Export

Currently only PDF (via browser print) is supported. A `POST /api/export/docx` route using `python-docx` or a Node.js DOCX library could generate a formatted Word document from the `MoMJson` structure.

---

### Live Transcription

The Web Speech API can provide real-time browser transcription during live recording. This could run in parallel with the Faster-Whisper pipeline to give the user an instant preview while the accurate local transcript processes in the background.

---

### Calendar Integration

After a meeting is created, automatically create a calendar event (Google Calendar or Outlook) with the MoM attached. Would require OAuth scopes beyond current auth setup.

---

### Team Collaboration

Currently each meeting is private to the creating user. A `meeting_members` join table with share-link or email-invite functionality would enable collaborative viewing and editing of MoMs.

---

### Recurring Meeting Templates

Store meeting templates (title, agenda, participant list) to pre-fill the New Meeting form for standup or sprint planning meetings that repeat on a schedule.

---

## 17. Environment Variables

### Next.js App (`.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL (e.g. `https://abc.supabase.co`). Public — safe for browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key. Public — safe for browser. Used for client-side Supabase calls. |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ Optional | Service role key for admin-level DB operations. Keep server-side only — never expose to client. Not currently used but recommended for future admin tasks. |
| `TRANSCRIPTION_SERVICE_URL` | ✅ | Base URL of the local Faster-Whisper FastAPI service. Example: `http://localhost:8000`. Server-side only. |
| `OLLAMA_BASE_URL` | ✅ | Base URL of the local Ollama server. Example: `http://localhost:11434`. Server-side only. |

**Note:** `TRANSCRIPTION_SERVICE_URL` and `OLLAMA_BASE_URL` are not yet in `.env.local.example` — they must be added as part of Phase 4/5 implementation.

---

### Faster-Whisper Service (`services/transcription/.env`)

| Variable | Default | Description |
|---|---|---|
| `TRANSCRIPTION_MODEL` | `small` | Whisper model size: `tiny`, `base`, `small`, `medium`, `large-v3` |
| `TRANSCRIPTION_DEVICE` | `cpu` | `cpu` or `cuda` (requires NVIDIA GPU + CUDA toolkit) |
| `TRANSCRIPTION_COMPUTE_TYPE` | `int8` | Quantization: `int8`, `float16`, `float32` |
| `MAX_AUDIO_MB` | `100` | Maximum audio file size in MB |
| `AUDIO_DOWNLOAD_TIMEOUT_SECONDS` | `60` | Timeout for downloading audio from Supabase Storage |

---

## 18. Dependencies

### Production Dependencies (`package.json`)

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.6 | App framework |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | DOM renderer |
| `@supabase/supabase-js` | ^2.107.0 | Supabase JS client |
| `@supabase/ssr` | ^0.10.3 | Supabase SSR helpers for Next.js cookie handling |
| `radix-ui` | ^1.4.3 | Radix UI primitives (used by shadcn) |
| `class-variance-authority` | ^0.7.1 | Variant-based className builder (used by shadcn) |
| `clsx` | ^2.1.1 | Conditional className joining |
| `tailwind-merge` | ^3.6.0 | Merge Tailwind classes without conflicts |
| `lucide-react` | ^1.16.0 | Icon library |
| `next-themes` | ^0.4.6 | Dark/light mode provider |
| `sonner` | ^2.0.7 | Toast notifications |
| `shadcn` | ^4.8.0 | shadcn CLI (used for `bunx shadcn@latest add`) |
| `tw-animate-css` | ^1.4.0 | Tailwind animation utilities |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@biomejs/biome` | 2.2.0 | Linter + formatter |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `tailwindcss` | ^4 | CSS utility framework |
| `typescript` | ^5 | Type checking |
| `@types/node` | ^20 | Node type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |

### Python Service (`services/transcription/requirements.txt`)

| Package | Purpose |
|---|---|
| `fastapi` | HTTP API framework |
| `uvicorn[standard]` | ASGI server |
| `python-dotenv` | `.env` file loading |
| `pydantic` | Request/response schema validation |
| `faster-whisper` | Local Whisper speech-to-text |
| `httpx` | Async HTTP client for audio download |

### Not Yet Installed (required for completion)

| Package | Purpose | Install with |
|---|---|---|
| _(none — Ollama is called via HTTP, no SDK needed)_ | | |

> The Ollama and Faster-Whisper services are called over HTTP — no Node.js SDK is needed. The helper modules `src/lib/transcription.ts` and `src/lib/ollama.ts` will use the native `fetch` API.

---

## 19. Deployment Instructions

### Next.js App

The app is not yet deployed. The recommended platform is **Vercel** (zero-config for Next.js).

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy from project root
vercel

# Set environment variables in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add TRANSCRIPTION_SERVICE_URL   # Point to cloud VM when ready
vercel env add OLLAMA_BASE_URL             # Point to cloud VM when ready
```

**Important:** `TRANSCRIPTION_SERVICE_URL` and `OLLAMA_BASE_URL` must point to publicly accessible services when deployed. During development they point to `localhost`.

---

### Faster-Whisper Service (local dev)

```bash
cd services/transcription

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo TRANSCRIPTION_MODEL=small > .env
echo TRANSCRIPTION_DEVICE=cpu >> .env
echo TRANSCRIPTION_COMPUTE_TYPE=int8 >> .env

# Start the service (default port 8000)
uvicorn app.main:app --reload --port 8000
```

Verify it's running:
```bash
curl http://localhost:8000/health
# {"status": "ok", "service": "transcription"}
```

**First request will be slow** (~10–30s on CPU) because the Whisper model downloads and loads into memory on startup.

---

### Ollama (local dev)

```bash
# Install Ollama from https://ollama.com/download
# Then pull the Qwen 3 model:
ollama pull qwen3

# Ollama starts automatically as a system service after install
# Verify it's running:
curl http://localhost:11434/api/tags
```

To use a fallback model instead:
```bash
ollama pull gemma3      # Google Gemma
ollama pull llama3.2    # Meta Llama
```

---

### Supabase Setup (manual — one-time)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy `URL` and `anon public` key into `.env.local`
3. Go to **SQL Editor** and run the full schema from `implementation.md` Section 5
4. Add the `participants TEXT` column to the `meetings` table:
   ```sql
   ALTER TABLE meetings ADD COLUMN IF NOT EXISTS participants TEXT;
   ```
5. Enable RLS on all tables and create the policies (from `implementation.md` Section 5)
6. Go to **Storage** → create a new bucket named `meeting-audio`, set to **private**
7. Add a storage policy allowing authenticated users to upload to their own folder:
   ```sql
   CREATE POLICY "User can upload own audio"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'meeting-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

---

## 20. Quick Start

Follow these steps in order to get a fully running local development environment.

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 20 (for any tooling that requires it)
- [Python](https://python.org) >= 3.10 (for the transcription service)
- [Ollama](https://ollama.com/download) installed and running
- A [Supabase](https://supabase.com) project created (free tier is fine)

---

### Step 1 — Clone and install

```bash
cd "c:\workspace personal\MoM"
bun install
```

---

### Step 2 — Configure environment

```bash
# Copy the example file
copy .env.local.example .env.local
```

Edit `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
TRANSCRIPTION_SERVICE_URL=http://localhost:8000
OLLAMA_BASE_URL=http://localhost:11434
```

---

### Step 3 — Set up Supabase

1. Open your Supabase project → SQL Editor
2. Paste and run the full schema from `implementation.md` Section 5
3. Run the participants migration:
   ```sql
   ALTER TABLE meetings ADD COLUMN IF NOT EXISTS participants TEXT;
   ```
4. Create the `meeting-audio` storage bucket (private) in Storage → Buckets
5. Apply the storage policy from Section 19 of this document

---

### Step 4 — Start Ollama and pull the model

```bash
# Ollama should already be running as a system service after install
# Pull Qwen 3 if not already done:
ollama pull qwen3
```

---

### Step 5 — Start the Faster-Whisper service

```bash
cd services/transcription
python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Leave this terminal open. Wait for the startup log confirming the model is loaded.

---

### Step 6 — Start the Next.js dev server

Open a new terminal:

```bash
cd "c:\workspace personal\MoM"
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### Step 7 — Understand the current state

When you open the app you will see the full UI working with **mock data**. The following things are expected:
- Login/signup appears to work but does NOT create a real Supabase session — it's using localStorage
- The dashboard shows 3 hardcoded mock meetings
- The wizard flows through New Meeting → Record → Transcript → MoM using mock data and fake progress timers
- No audio is actually recorded or uploaded
- No real transcription or AI generation happens

**This is the intended starting point.** All of the UI is production-ready. Your job is to replace all mock/stub implementations with real integrations following the requirements in `.kiro/specs/mom-generator-completion/requirements.md`.

---

### Where to Start

Work in this order to avoid blocking dependencies:

1. **Fix `MeetingContext`** → add `meetingId` field. Everything else in the wizard depends on this.
2. **Fix auth** → wire login/signup to Supabase, fix middleware redirects, fix sidebar.
3. **Fix Dashboard** → wire to `GET /api/meetings`, fix meeting card navigation.
4. **Fix new meeting flow** → wire `POST /api/meetings`, store UUID in context, fix navigation.
5. **Fix audio recorder** → implement `MediaRecorder` + `audioBlob` in the hook.
6. **Fix audio upload** → implement Supabase Storage upload with progress.
7. **Create `/api/transcribe`** → wire transcript page.
8. **Create `/api/summarize`** → wire MoM page, update `MomRenderer` for JSON input.
9. **Fix remaining bugs** → `font-sora`, `parseInt`, status `"processing"`, PATCH key.
10. **Remove mock data** → delete `src/lib/mock-data.ts` once all pages are wired.

---

### Key Files to Read First

| File | Why |
|---|---|
| `.kiro/specs/mom-generator-completion/requirements.md` | The full spec — read this before writing any code |
| `src/components/meeting/meeting-context.tsx` | Understand the context shape before touching wizard pages |
| `src/middleware.ts` | Add redirect logic here (it currently does nothing except refresh the session) |
| `src/app/(app)/meetings/[id]/transcript/page.tsx` | See how the mock transcription flow is structured — this is the template for the real one |
| `services/transcription/app/main.py` + `schemas.py` | Understand the exact request/response format before writing `/api/transcribe` |

---

### Linting and Formatting

```bash
# Check for lint errors
bun run lint

# Auto-format all files
bun run format

# Type check
bun run build   # build will surface all TypeScript errors
```

---

### Adding shadcn Components

Never install shadcn components with `bun add`. Always use the CLI:

```bash
bunx --bun shadcn@latest add <component-name>
```

Example:
```bash
bunx --bun shadcn@latest add table
```

Check what's already installed before adding — all current components are in `src/components/ui/`.
