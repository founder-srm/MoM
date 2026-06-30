# MoM Project — Issues & Fixes Documentation

> This file documents every issue found, the fix applied, and rationale. Kept for future agent context.

---

## Build-Blocking Issues

### 1. Next.js 16 Route Params — Promise Pattern

**Files:** `src/app/(app)/meetings/[id]/page.tsx`, `src/app/api/meetings/[id]/route.ts`

**Problem:** Next.js 16 requires `params` to be typed as `Promise<{ id: string }>` and awaited inside the component/route handler. The old synchronous pattern causes corrupted `.next/dev/types/routes.d.ts` generation with duplicated/stray code.

**Fix:**

- Page components: `{ params }: { params: Promise<{ id: string }> }` + `const { id } = await params`
- Route handlers: `context: { params: Promise<{ id: string }> }` + `const { id } = await context.params`

### 2. middleware.ts → proxy.ts (Next.js 16)

**File:** `src/middleware.ts`

**Problem:** Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. The build emits a deprecation warning.

**Fix:** Rename file and update internal references. The structure and API remain identical.

---

## Functional Bugs

### 3. Hardcoded Meeting ID in Wizard Navigation

**Files:** `src/app/(app)/meetings/new/page.tsx`, `src/app/(app)/meetings/[id]/record/page.tsx`, `src/app/(app)/meetings/[id]/transcript/page.tsx`, `src/app/(app)/meetings/[id]/mom/page.tsx`

**Problem:** All wizard steps navigate using `router.push("/meetings/draft-1/...")` instead of using a real meeting ID. The MeetingContext tracks form data but no ID is generated.

**Fix:** Generate a temporary client-side `meetingId` using `crypto.randomUUID()` and store it in MeetingContext. All navigation uses `meetingId` from context.

### 4. Font Mismatch — "font-sora" Not Loaded

**Files:** `src/app/(app)/layout.tsx`

**Problem:** The app layout uses `font-sora` CSS class but only Inter and Instrument Serif fonts are loaded via Next.js font loader. Sora font is never loaded, so the class falls through to the system sans-serif.

**Fix:** Either remove `font-sora` from the layout and use `font-sans` (Inter), or add `next/font/google` import for Sora. Going with Inter since it's loaded and looks great.

---

## Code Quality Issues

### 5. `catch (error: any)` in All API Routes

**Files:** All files under `src/app/api/` and `src/components/ui/sonner.tsx`

**Problem:** 14+ instances of `catch (error: any)` which blocks Biome linting. `any` disables type checking.

**Fix:** Replace `catch (error: any)` with `catch (error: unknown)` and use proper type narrowing: `const message = error instanceof Error ? error.message : "An unexpected error occurred"`

### 6. Biome Formatting Issues (147 errors)

**Files:** Multiple across project

**Problem:** Inconsistent formatting in JSON files, missing trailing newlines, whitespace issues, and `.agents/` directory files not in the project's format style.

**Fix:** Run `bun run lint --fix` to auto-format. Add `.agents/` to Biome ignore list since it's third-party tooling.

### 7. Theme Variable Mismatch

**File:** `components.json` vs `src/app/layout.tsx`

**Problem:** `components.json` points CSS to `src/styles/globals_claude.css` but the root layout imports `src/styles/globals.css`. The global CSS `globals.css` includes `@import "shadcn/tailwind.css"` which provides the theme variables, so it works — but the `components.json` config is misleading. No change needed as `globals.css` is the correct file per rule #4 (don't modify styles).

---

## UI/UX Improvements

### 8. Login Uses localStorage Mock

**File:** `src/app/(auth)/login/page.tsx`

**Problem:** Login uses `localStorage.setItem("userEmail", email)` and then navigates. Until Supabase is connected, this is the functional mock.

**Fix:** Ensure the mock gracefully handles edge cases (empty fields, redirect after login). Add proper error feedback on the form. Keep the mock functional for now but document it's temporary.

### 9. No Error Boundaries on Client Pages

**Files:** All `"use client"` pages

**Problem:** Client components don't have error boundaries. If `meetingData` is null in wizard steps, it could crash.

**Fix:** Add null checks and graceful fallbacks where `meetingData` is accessed.

---

## Environment Setup

### 10. Missing `.env.local`

**Status:** User is working on DB separately, so this is expected for now. All Supabase/Groq calls are stubbed.

**Note:** When ready, the following env vars are needed:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
```

---

## Quick Commands Reference

```bash
# Format all files
bun run lint --fix

# Check for type errors
bun run build

# Run dev server
bun run dev
```

> **Last Updated:** 2026-06-30
