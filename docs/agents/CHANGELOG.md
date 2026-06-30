# MoM Project — Changelog

> Records all changes made to the project for future agent context.

## 2026-06-30 — Initial Audit & Fixes

### Build-Blocking Fixes

1. **Fixed Next.js 16 route params pattern** — `src/app/(app)/meetings/[id]/page.tsx` and `src/app/api/meetings/[id]/route.ts`
   - Changed `params: { id: string }` → `params: Promise<{ id: string }>` with `await`
   - Removed the complex `typeof (params as any).then` workaround

2. **Renamed `middleware.ts` → `proxy.ts`** — Next.js 16 migration
   - Renamed the exported function from `middleware` to `proxy`
   - Removed deprecation warning from build output

3. **Cleared `.next/` cache** — Regenerated clean route types

### Functional Bug Fixes

4. **Fixed hardcoded "draft-1" navigation** — All 4 wizard step pages
   - Added `meetingId` and `getOrCreateMeetingId()` to `MeetingContext`
   - `crypto.randomUUID()` generates a unique ID per meeting flow
   - All `router.push("/meetings/draft-1/...")` → `router.push(\`/meetings/${meetingId}/...\`)`

5. **Fixed font mismatch** — `src/app/(app)/layout.tsx`
   - Removed `font-sora` class (Sora font was never loaded)
   - App now correctly uses Inter (loaded via `next/font/google`)

### Code Quality Fixes

6. **Fixed all `catch (error: any)` → `catch (error: unknown)`** — 7 API route files
   - Added proper type narrowing: `error instanceof Error ? error.message : "An unexpected error occurred"`

7. **Ran Biome format fix** — 64 files auto-formatted
   - Added `.agents/` to Biome ignore list (third-party tooling)

### Build Status

- `bun run build` — ✅ Passes (0 errors)
- `bun run lint` — ⚠️ 55 remaining warnings (all a11y: SVG titles, button types, label associations — non-blocking)
- `bun run dev` — ✅ Starts successfully

### Remaining Known Issues (Non-Blocking)

- No `.env.local` — Supabase/Groq calls will fail at runtime (expected, DB is being designed)
- All data is mocked — `MOCK_MEETINGS`, `MOCK_TRANSCRIPT`, `MOCK_MOM`
- Auth is localStorage-based mock — no real Supabase auth
- 55 a11y lint warnings — SVG `<title>`, button `type`, label `htmlFor`
- Transcription service (`services/transcription/`) only has health endpoint
