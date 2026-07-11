# Supabase backend readiness audit

## 1. Final database schema

### public.profiles
- id: uuid, primary key, references auth.users(id) on delete cascade
- name: text, nullable
- email: text, nullable
- created_at: timestamptz, not null, default now()

### public.meetings
- meeting_id: uuid, primary key, default gen_random_uuid()
- user_id: uuid, not null, references public.profiles(id) on delete cascade
- title: text, not null, check length 1-200
- date: date, nullable
- participants: text, nullable
- description: text, nullable
- status: public.meeting_status, not null, default 'created'
- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

### public.audio_files
- file_id: uuid, primary key, default gen_random_uuid()
- meeting_id: uuid, not null, references public.meetings(meeting_id) on delete cascade
- storage_path: text, not null
- storage_url: text, nullable
- file_name: text, nullable
- file_size: bigint, nullable, check > 0
- mime_type: text, nullable
- created_at: timestamptz, not null, default now()

### public.transcripts
- transcript_id: uuid, primary key, default gen_random_uuid()
- meeting_id: uuid, not null, references public.meetings(meeting_id) on delete cascade
- transcript_text: text, not null, check non-empty
- edited_text: text, nullable
- language: text, nullable, check length 2-5
- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

### public.summaries
- summary_id: uuid, primary key, default gen_random_uuid()
- meeting_id: uuid, not null, references public.meetings(meeting_id) on delete cascade
- summary_text: text, not null, check non-empty
- created_at: timestamptz, not null, default now()

### public.moms
- mom_id: uuid, primary key, default gen_random_uuid()
- meeting_id: uuid, not null, references public.meetings(meeting_id) on delete cascade
- mom_content: text, not null, check non-empty
- created_at: timestamptz, not null, default now()
- updated_at: timestamptz, not null, default now()

## 2. SQL migrations generated
- [supabase/migrations/001_initial_schema.sql](../supabase/migrations/001_initial_schema.sql)
- [supabase/migrations/002_triggers.sql](../supabase/migrations/002_triggers.sql)
- [supabase/migrations/003_rls_policies.sql](../supabase/migrations/003_rls_policies.sql)

## 3. Storage plan
- Bucket: meeting-audio
- Public: false
- Allowed upload path pattern: ${user_id}/${meeting_id}/audio.${ext}
- Ownership: uploaded files are scoped by meeting user_id through RLS and application checks

## 4. RLS summary
- Users can only select/insert/update/delete their own meetings
- Child rows are restricted by ownership through the parent meeting
- No public access

## 5. RPC / DB function recommendations
- Keep the current model for now; no RPC is strictly required for the MVP
- Consider a database trigger or RPC later for automatic transcript/summary cleanup if the workflow becomes more complex

## 6. Environment variables
See [.env.example](../.env.example)

## 7. Client audit
- One browser client implementation exists in [src/lib/supabase/client.ts](../src/lib/supabase/client.ts)
- One server client abstraction exists in [src/lib/supabase/server.ts](../src/lib/supabase/server.ts)
- Middleware uses the same server client wrapper

## 8. Service audit
- Services are now aligned to the same table names and columns
- The audio service uses storage_path and storage_url consistently
- The transcript service uses meeting-based upsert semantics

## 9. API audit improvements
- Add explicit handling for malformed JSON bodies
- Return 404 when a meeting is not owned by the current user rather than failing on update/delete
- Validate storage ownership before audio metadata insertions
- Replace the current transcription route’s placeholder status flow with a real background job once the transcription service is available

## 10. Remaining checklist
### High priority
- Create Supabase project and apply migrations
- Configure storage bucket and RLS policies
- Add auth providers and redirect URLs
- Set environment variables in deployment

### Medium priority
- Wire real audio upload route to storage and metadata persistence
- Replace the current transcription placeholder with a worker/queue or background task
- Add integration tests for each API route

### Low priority
- Add database views or RPC helpers for reporting
- Add telemetry and alerting
