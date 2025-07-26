# CHANGELOG

## 2025-07-26

- Removed unused GameState and PlayerId imports from `gameDatabase.ts` to fix ESLint errors
- Added presence-based lobby sync logic and Prettier formatting

## 2025-07-23

- Initial project repo created for "Thirty Challenge" (تحدي الثلاثين)
- Set up Vite + React + TypeScript + Tailwind CSS 3.5 + Framer Motion (dark mode)
- Configured Supabase integration (env example, client scaffold)
- Fixed .gitignore and cleaned repo structure, removed old Desktop/ path
- Set up GitHub Actions for CI (Vite, Node 18)
- Verified Tailwind works across all devices (PC, iPhone, Safari/Chrome)
- Installed React Router v6 for SPA routing
- Set up local/dev environment for host/guest join flow
- Clarified requirements: no tournament, just a single session per game with host + 2 guests, quiz segments in Arabic, settings/buttons in English
- **Plan:** Landing page, Join page, and Quiz Room scaffolding with animated dark UI (modern blue/violet glow)
- Will use Daily.co for first video chat integration (simple, reliable, easy to switch to LiveKit later)

---

All further project changes will be documented in this file.
