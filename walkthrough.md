# MoM Generator — Implementation Walkthrough

This document describes the current state of the MoM Generator codebase, the architecture decisions, and what is needed to move from mock mode to production.

---

## 1. Current Project State

### Completed
- Next.js 16 App Router scaffold with `/(auth)` and `/(app)` route groups
- Full shadcn/ui component set installed and integrated
- Supabase SSR clients prepared for server and browser
- TypeScript schema definitions for 6 core tables
- Interactive flows: Login, Dashboard, and 4-step Meeting Creation Wizard
- AI pipeline integrated with Groq for transcription, summarization, and MoM generation
- Server actions added for transcription and MoM generation

### Pending / Required to Go Live
- Supabase project credentials in `.env.local`
- Groq API key in `.env.local`
- Real audio upload to Supabase Storage
- Replace mock data with live Supabase queries

---

## 2. Architecture

```
src/
├── app/
│   ├── layout.tsx                   # Root layout + fonts + theme provider
│   ├── page.tsx                     # Landing/redirect
│   ├── (auth)/
│   │   ├── layout.tsx               # Centered auth layout
│   │   └── login/page.tsx           # Sign in / sign up
│   ├── (app)/
│   │   ├── layout.tsx               # App shell with sidebar + MeetingProvider
│   │   ├── dashboard/page.tsx       # Meeting list + stats
│   │   └── meetings/
│   │       ├── new/page.tsx         # Meeting details form
│   │       └── [id]/
│   │           ├── page.tsx         # Meeting overview
│   │           ├── record/page.tsx  # Audio input (record/upload)
│   │           ├── transcript/page.tsx
│   │           └── mom/page.tsx
│   └── api/
│       ├── transcribe/route.ts      # Groq Whisper transcription
│       ├── summarize/route.ts       # Groq LLM summary + MoM
│       └── ...
├── actions/
│   ├── transcribe.ts                # Server action: trigger transcription
│   └── generate-mom.ts              # Server action: trigger summary + MoM
├── components/
│   ├── ui/                          # shadcn components
│   ├── dashboard/
│   ├── layout/
│   └── meeting/
│       ├── meeting-context.tsx      # MeetingProvider / useMeetingFlow
│       └── mom-renderer.tsx
├── hooks/
│   ├── use-audio-recorder.ts
│   └── use-mobile.ts
├── lib/
│   ├── groq.ts                      # Groq client singleton
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── services/                    # Supabase table services
│   └── types/
│       └── database.ts
└── styles/
    ├── globals.css
    ├── globals_claude.css
    └── globals_fc.css
```

---

## 3. AI Pipeline

### Transcription
- Endpoint: `POST /api/transcribe`
- Input: `meeting_id`
- Flow:
  1. Look up audio record by `meeting_id`
  2. Create signed download URL for Supabase Storage
  3. Call Groq Whisper API: `whisper-large-v3-turbo`
  4. Upsert transcript text to `transcripts`
  5. Update meeting status to `completed`

### Summarization + MoM
- Endpoint: `POST /api/summarize`
- Input: `meeting_id`
- Flow:
  1. Load transcript (prefer edited text if present)
  2. Generate summary via Groq LLM: `llama-3.3-70b-versatile`
  3. Generate MoM Markdown via Groq LLM
  4. Upsert `summaries` and `moms`
  5. Update meeting status to `completed`

### Server Actions
- `src/actions/transcribe.ts`
- `src/actions/generate-mom.ts`
- These call the API routes internally, handle state transitions, and revalidate cached paths.

### Environment
- `GROQ_API_KEY` required
- No local Whisper service needed anymore

---

## 4. Frontend Flows

### Login
- Split role: Sign In / Sign Up
- Mock auth for now; stores email locally and redirects to `/dashboard`

### Dashboard
- Stats cards: total meetings, this month, completed
- Search by title or participant
- Meeting cards with status badges
- “New Meeting” CTA

### New Meeting Wizard
1. **Details:** title, date, participants, agenda
2. **Audio Input:** record live or upload file; on proceed, calls `transcribeMeeting`
3. **Transcript Review:** processing animation, then editable transcript
4. **MoM Viewer:** generates summary/MoM via `generateMom`, editable preview, copy, and save actions

---

## 5. Backend Readiness

### Supabase
- SSR clients: `src/lib/supabase/server.ts` and `client.ts`
- Type definitions: `src/lib/types/database.ts`
- Services under `src/lib/services/`
- Tables expected: `profiles`, `meetings`, `audio_files`, `transcripts`, `summaries`, `moms`

### Storage
- Bucket: `meeting-audio`
- Accepted formats: mp3, wav, m4a, webm, ogg
- Max size: 50MB

---

## 6. How to Switch from Mock to Live

1. Add to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `GROQ_API_KEY`
2. Run Supabase SQL migrations for schema + RLS
3. Create `meeting-audio` bucket and storage policies
4. Replace mock data usage in pages/components with Supabase queries/services
5. Wire actual audio upload in `record/page.tsx` using `uploadAudioToStorage`

---

## 7. Known Limitations

- Auth is mocked; no real Supabase Auth flow wired yet
- Audio upload does not persist to Supabase Storage yet
- Dashboard uses `MOCK_MEETINGS` instead of live DB queries
- Meeting detail pages still use mock data and hardcoded `draft-1` routes

---

## 8. Commands

```bash
npm run dev
npm run build
npm run lint
```

---

## 9. Pull Request Details

### Title
feat: Add Groq AI pipeline and integrate transcription + MoM generation

### Description
This PR adds the end-to-end AI pipeline to the MoM Generator app and integrates it into the meeting creation wizard.

**What changed**
- Added `groq-sdk`
- Implemented `POST /api/transcribe` using Groq Whisper
- Implemented `POST /api/summarize` using Groq LLM
- Added server actions `src/actions/transcribe.ts` and `src/actions/generate-mom.ts`
- Integrated transcription trigger in `record/page.tsx` with loading and toast feedback
- Updated `.env.example` with `GROQ_API_KEY`

**Why**
- Removes dependency on a local Faster-Whisper service
- Enables real transcription and Minutes-of-Meeting generation in the frontend flow
- Keeps the app runnable in mock mode while AI credentials are configured

**Notes for reviewers**
- The app still uses mock meeting data. Live Supabase integration is pending env setup.
- Audio upload to Supabase Storage is not implemented yet.
- To test AI locally, set `GROQ_API_KEY` and use the “Process Audio” flow.

### Checklist
- [ ] Tests added/updated
- [ ] `npm run build` passes
- [ ] `.env.example` updated
- [ ] Documentation updated