# Copilot Instructions for Thirty Challenge

## Project Overview
- **Purpose:** Real-time, club-themed football quiz web app (see `PROJECT_OVERVIEW.md` for canonical details).
- **Stack:** React 19, Vite 7, Tailwind 3.4, Supabase JS 2.19, Daily JS 0.56, Framer Motion 12.
- **Live:** https://quiz.tyshub.xyz (Netlify)

## Architecture & Key Patterns
- **UI:** React 19 function components/hooks only. No class components. Tailwind utility classes only.
- **State:** Jotai atoms in `src/state/` (keep small, single-responsibility). No Redux/MobX.
- **Segments:** Segment-specific logic in `src/segments/` (e.g., BELL, SING, REMO). Use hooks for segment logic.
- **Realtime:** Supabase channels for game state sync. Daily.co for video. See `src/api/` for integration.
- **Env Vars:** All secrets/config in `.env` (see `.env.example`). Never hard-code. Throw errors if missing at runtime.
- **Bundle:** Warn if any import adds >10 kB min+gzip. Hard limit: <200 kB JS bundle.
- **Dependency Map:** Never introduce cycles. Check `full-dependency-map.json` after changes.

## Developer Workflows
- **Build:** `pnpm build` (Vite)
- **Typecheck:** `pnpm tsc --noEmit`
- **Lint:** `pnpm lint`
- **Test:** `pnpm test` (Vitest)
- **Dependency Map:** `pnpm dep:graph` (updates `full-dependency-map.json`)
- **Flowchart:** `pnpm flow:update` (updates `docs/current-flow.mmd`)
- **Netlify:** Deploys on push to main. Fix build errors by checking env vars and bundle size.

## Pull Request Checklist
1. Code compiles (`pnpm tsc --noEmit`)
2. ESLint passes (`pnpm lint`)
3. Vitest passes (`pnpm test`)
4. Bundle size guard (<200 kB JS)
5. Regenerate dependency map if structure changes
6. Update docs if behavior changes

## Refactor Workflow (for AI Agents)
1. Open issue tagged `needs-gpt` with intent and flowchart reference
2. Wait for human approval
3. Branch: `gpt/<short-desc>`
4. Run `pnpm dep:graph` & `pnpm flow:update`
5. Open Draft PR with bundle report
6. On approval, squash-merge; Netlify preview must pass

## Hard NOs
- No Redux/MobX, no UI kits >30 kB, no beta/next packages
- Never commit `.env` or secrets

## Key Files & Directories
- `src/` – main app code (see subfolders for structure)
- `src/segments/` – segment logic (BELL, SING, REMO, etc.)
- `src/api/` – Supabase/Daily integration
- `full-dependency-map.json` – check for cycles
- `docs/current-flow.mmd` – up-to-date flowchart
- `.env.example` – required env vars
- `PROJECT_OVERVIEW.md` – canonical project details

---
For more, see `AGENTS.md` and `PROJECT_OVERVIEW.md`. When in doubt, prefer explicit, minimal, and type-safe code. Ask for human review before major refactors.
