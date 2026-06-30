# Design Overhaul Plan — Kinetic Typography

## Source: `docs/guides/design-system.md`

## Summary of Changes Needed

### 1. Global CSS (`src/styles/globals.css`)

- Replace all color tokens with Kinetic Typography system:
  - background: #09090B, foreground: #FAFAFA
  - accent: #DFE104 (acid yellow), accent-foreground: #000000
  - muted: #27272A, muted-foreground: #A1A1AA
  - border: #3F3F46
  - Remove all shadows (flat design)
  - Set radius to 0px (brutalist)
  - Add noise texture SVG

### 2. Fonts (`src/app/layout.tsx`)

- Replace Inter with Space Grotesk (primary)
- Keep Inter as fallback
- Remove Instrument Serif (no serif in this style)

### 3. shadcn Components (all under `src/components/ui/`)

- Remove rounded corners (0px radius)
- Remove shadows
- Use 2px borders with zinc-700 color
- Update button variants for kinetic style
- Update card for brutalist style with hover color inversion
- Update input for oversized kinetic style

### 4. Layout (`src/app/(app)/layout.tsx`)

- Remove sidebar navigation
- Full-width content
- Add noise texture overlay

### 5. Pages

- **Login**: Redesign with kinetic typography hero
- **Dashboard**: Redesign with massive stats, marquees
- **Meeting Wizard**: Redesign all 4 steps with brutalist cards
- **Meeting Detail**: Redesign with kinetic typography

### 6. New Dependencies

- `react-fast-marquee` — for infinite scrolling marquees
- `framer-motion` — for scroll-triggered animations
- `next/font/google` for Space Grotesk

### 7. New Components

- Noise texture overlay
- Marquee components (stats, testimonials)
- Kinetic button variants
