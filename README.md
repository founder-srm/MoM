## Development

This repo uses **Bun** as the package manager and lockfile source of truth.

```bash
bun install
bun run dev
bun run build
bun run lint
```

Do not commit `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.


## AI Pipeline Architecture

The application uses a two-stage AI pipeline for meeting minutes generation:

```
Audio Recording / Upload
            │
            ▼
      Faster-Whisper
(Local Speech-to-Text)
            │
            ▼
      Clean Transcript
            │
            ▼
     POST /api/summarize
            │
            ▼
          Groq LLM
            │
            ▼
 Structured JSON Output
            │
            ▼
Frontend Rendering
(MoM, Executive Summary, Highlights, Decisions, Action Items, SOP)
```

### Components

1. **Faster-Whisper Service** (Speech-to-Text)
   - Responsible ONLY for speech-to-text transcription
   - Language detection
   - Returns transcript text
   - Configured via `WHISPER_SERVICE_URL` environment variable

2. **Groq LLM** (AI Summarization)
   - Receives ONLY transcript text (never raw audio)
   - Generates structured meeting analysis:
     - Executive Summary
     - Meeting Summary
     - Key Highlights
     - Decisions
     - Action Items
     - Risks
     - SOP (Standard Operating Procedure)
   - Configured via `GROQ_API_KEY` environment variable

### API Endpoints

- `POST /api/transcribe` - Forwards audio to Faster-Whisper service
- `POST /api/summarize` - Sends transcript to Groq for structured analysis


## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Faster-Whisper Transcription Service
# URL of the existing Faster-Whisper HTTP service
WHISPER_SERVICE_URL=http://localhost:8000

# Groq API Configuration
# Used for AI summarization and MoM generation
GROQ_API_KEY=your-groq-api-key

# Optional: Supabase Audio Storage Bucket
SUPABASE_AUDIO_BUCKET=meeting-audio
```

### Required Services

1. **Faster-Whisper Service** (Local Speech-to-Text)
   - **Dependency:** This service MUST be running before starting the application
   - Must be running and accessible at `WHISPER_SERVICE_URL` (e.g., `http://localhost:8000`)
   - Responsible ONLY for speech-to-text transcription and language detection
   - Expected to accept POST requests with JSON body:
     ```json
     {
       "audio_url": "string",
       "meeting_id": "string",
       "audio_file_id": "string"
     }
     ```
   - Expected to return JSON:
     ```json
     {
       "text": "transcript text",
       "language": "detected language",
       "duration": 120
     }
     ```
   - **Important:** This service should already be implemented and working. Do NOT modify it.

2. **Groq API Key** (AI Summarization)
   - Sign up at [console.groq.com](https://console.groq.com)
   - Create an API key
   - Add to `.env.local` as `GROQ_API_KEY`
   - **Note:** Groq receives ONLY transcript text, never raw audio


## Startup Order

1. **Start Faster-Whisper service** first
   ```bash
   # Example: Start your existing Faster-Whisper service on port 8000
   # Ensure WHISPER_SERVICE_URL in .env.local matches the service URL
   ```

2. **Start the Next.js application**
   ```bash
   npm run dev
   ```

3. **Verify services are running**
   - Faster-Whisper: `curl http://localhost:8000/health` (or your configured endpoint)
   - Next.js: Open `http://localhost:3000`

## AI Request Flow

1. **User records/upload audio** → Frontend
2. **Audio saved to Supabase Storage** → API Route
3. **Transcription request** → `/api/transcribe` → Faster-Whisper service
   - Returns: transcript text, language, duration
   - Error 503 if service unavailable
4. **Summarization request** → `/api/summarize` → Groq LLM
   - Input: transcript text only
   - Returns: structured JSON with executive summary, highlights, decisions, action items, risks, SOP
   - Error 502 if service fails

## Security Notes

- `GROQ_API_KEY` is server-side only and never exposed to the client
- `WHISPER_SERVICE_URL` is server-side only
- No API keys or secrets are imported into client components
- Raw transcripts, prompts, and generated content are not logged
- Audio files are never sent to Groq

## Guides
  1. Find the Shadcn guides [here](./docs/guides/shadcn.md)
  2. Read the project documentation [here](./docs/project-documentation.md)


## License

This project is **source-available but not open source**.

You may view the code for reference only. You may not copy, reuse, modify, distribute,
deploy, or use this project or any part of it for another club, organization, product,
or platform without written permission.

See the [LICENSE](./LICENSE.md) file for details.
