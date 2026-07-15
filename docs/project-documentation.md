# Project Documentation

## Overview

This document captures the current structure, purpose, and key changes for the MoM project. It is intended to help any future reader understand the project files, implementation decisions, and how to work with the repository.

## Purpose

MoM is a meeting minutes application built with Next.js App Router, Shadcn UI, Tailwind CSS, and Supabase-ready backend integrations. The application delivers:

- AI-driven meeting summary workflows
- Authenticated access
- Responsive dashboards and meeting flows
- Structured meeting transcript and MoM generation

## Key Technologies

- Next.js 16 App Router
- TypeScript
- Tailwind CSS / Shadcn UI
- Supabase client setup
- Bun package manager

## Primary Project Structure

- `src/app/` - Next.js routes and layout structure
  - `layout.tsx` - root app layout and theme provider
  - `(auth)/` - authentication route group
  - `(app)/` - main application route group
- `src/components/` - reusable UI and app components
- `src/lib/` - utilities, Supabase clients, and helpers
- `src/styles/` - global style definitions and theme variables
- `docs/` - supporting documentation for the project

## Important Files

- `README.md` - high level repo instructions and setup
- `docs/project-documentation.md` - this documentation file
- `docs/guides/shadcn.md` - Shadcn-specific guidance
- `src/app/(auth)/layout.tsx` - auth page wrapper
- `src/app/(auth)/login/page.tsx` - login/signup page interface
- `src/styles/globals.css` - global theme variables and shared styles

## Auth Page Layout

The authentication page is designed to be visually consistent and uniform across the full screen.

Recent layout improvements include:

- Full-width centered auth container
- Unified dark background across the page
- Rounded outer card wrapper and consistent border styling
- Refined spacing and padding in the login/sign-up panel
- Updated auth layout to remove blue gradient edges and ensure a clean appearance

## Usage

### Install dependencies

```bash
bun install
```

### Run development server

```bash
bun run dev
```

### Build for production

```bash
bun run build
```

### Linting

```bash
bun run lint
```

## Notes for Future Maintainers

- Keep the Shadcn UI component files under `src/components/ui/` aligned with the project theme.
- Preserve global style variables in `src/styles/globals.css` and avoid adding conflicting color definitions.
- The auth page currently uses a single dark theme, controlled by the `ThemeProvider` in the root layout.
- For additional design context, consult `docs/guides/shadcn.md` and the planning documents in `docs/`.

## Additional Reference Documents

- `docs/MoM_Planning_Document.md`
- `docs/project_planning_document.md`
- `docs/extracted_planning_doc.txt`

## Changelog

### 2026-07-12
- Updated `src/app/(auth)/layout.tsx` to use a consistent dark background and full-width auth wrapper.
- Refined `src/app/(auth)/login/page.tsx` with a centered outer card, improved spacing, and a clean auth form panel.
- Added documentation file `docs/project-documentation.md` for future maintainers and reviewers.
