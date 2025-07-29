> **Purpose:** This file explains the Thirty Challenge repo to an AI assistant (e.g. Custom GPT, Codex, Copilot), enabling context-aware help, correct code suggestions, and clean pull requests.

---

## 🧠 Project Identity

- **Name:** تحدي الثلاثين

- **Type:** Multiplayer browser quiz game (football-themed)

- **Stack:** Vite 7 + React 19 + Tailwind 3.4 + Supabase + Framer Motion 12 + Jotai + daily.co

- **Host:** Netlify (depoly site), Supabase (database), daily.co (video chat)

---

Current repo:
This repo and branch are used for testing. this repo was forked in order to facilitate easier editing.

---

## 🧠 Dependency Awareness Section

Always check `full-dependency-map.json` at repo root to understand real file relationships. — it is generated using `npx madge` and represents all `ts/tsx` dependencies across `src/`.

Do not rely on static folder assumptions. Use this file to:

- Find redundant files
- Suggest refactors
- Understand component hierarchy

Use full-dependency-map.json to avoid redundant changes or circular imports.
If adding new modules or folders, ensure madge-dependency-map.yml is rerun to update the file.

---

## 🧾 Environment Variables

The `.env` file exists **locally only**, and must include:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_DAILY_DOMAIN`
- `DAILY_API_KEY`

Agent should assume these are properly configured if `supabaseClient.ts` is present and error-free.
They are configure on Netlify

---

## 📌 Core Guidelines for AI Agents

- Always **assume Node 20**, ESM only — avoid `require`, use top-level `import`.

- Project uses **React 19** with functional components and hooks.

- CSS is **Tailwind 3.5** — never suggest inline styles or styled-components.

- Animations use **Framer Motion 12**.

- State management is **React context** for now. No Redux.

- Realtime and DB use **Supabase JS SDK v2.19.0**.

- MVP must remain **< 200kB JS** — avoid bloated libraries.

- All logic should be **client-side only** unless explicitly asked otherwise.

- Note: .env files are not committed to the repo but are expected to be present locally. Codex and agents must assume access to VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, DAILY_API_KEY, and others based on supabaseClient.ts.

- When outdated project assumptions are detected from `PROJECT_OVERVIEW.md` or `QUIZ_STRUCTURE.md`, validate against `full-dependency-map.json` and current branch structure before applying logic.

---

## 📂 Key Files and Their Roles (Old strcuture- not up to date with repo)

| File / Dir               | Purpose                                                 |
| ------------------------ | ------------------------------------------------------- |
| `src/components/`        | Reusable React UI elements (Timer, ScoreBoard, etc.)    |
| `src/pages/`             | Page-level entry points (`Lobby.tsx`, `Quiz.tsx`, etc.) |
| `src/themes/clubs.ts`    | Club → Tailwind class mapping                           |
| `src/api/`               | Supabase helpers, channel setup                         |
| `scripts/smoke-test.mjs` | Quick smoke build after install                         |
| `PROJECT_OVERVIEW.md`    | Stack rationale, tooling, folder structure              |
| `QUIZ_STRUCTURE.md`      | Segment order, question types, rules (WIP)              |
| `AGENT.MD`               | (this file) Agent onboarding                            |

## Task Types You Can Help With

- Creating new React components from spec (e.g. Timer, AnimatedPanel)

- Refactoring existing JSX into cleaner, composable units

- Writing Framer Motion transitions

- Writing/reading from Supabase tables or channels

- Creating simple test specs using **Vitest + @testing-library/react**

- Generating CI fixes (`ci.yml`)

- Explaining or fixing Netlify build errors

- Suggesting project board issues from TODOs or new features

---

## 🛑 Avoid Unless Explicitly Asked

- No Redux/MobX/Recoil suggestions.

- No deprecated React patterns (`useHistory`, `UNSAFE_`, etc.).

- Don’t suggest Tailwind hacks from v1/v2 era.

- Never bloat the bundle — no heavy chart libs, icon sets, UI kits.

- Don’t use beta packages or "next" releases.

- Don’t overwrite `.env` or suggest secrets hardcoding.

---

## ⚠️ Hosting Intent: LIVE Site

Do not assume this is a static SPA. This site is hosted on **Netlify with a custom domain (quiz.tyshub.xyz)** and relies on:

- Supabase (realtime DB)
- Daily.co (live video)
- Vite Dev + Production build

If `Supabase` or `Daily` fail, suggest alternatives or check `.env` placeholders. No data is hardcoded. Do not suggest fallback JSON.

---

## 📚 How to Learn from This Repo (Updated July 2025)

You can analyze:

- Any .ts or .tsx file in /src for syntax, imports, or logic.

- PROJECT_OVERVIEW.md in root for rationale behind the tech stack and structure.

- QUIZ_STRUCTURE.md in root for quiz segment logic, timing rules, and player flow.

- full-dependency-map.json (auto-generated by Madge) to trace how all modules relate.

- GitHub issues with the label needs-gpt for specific prompts or requested fixes.

- The approved changes section at the bottom of PROJECT_OVERVIEW.md for recent workflow decisions.

## 🌐 Deployment Expectation: LIVE Website, Not Static

This is not a static site. Codex should:

- Ensure any build or deployment flow preserves dynamic behavior using Supabase (database) and Daily.co (video API).

- Validate .env variables and runtime client initialization to ensure full backend connectivity.

- Always prioritize live testability during builds. Deployments should simulate production as closely as possible.

Deployment targets like Netlify must respect vite.config.ts, environment variables, and SSR fallbacks where needed.

---

## 🧪 When Suggesting Code…

- Return only compile-ready JSX or JS/TS (no pseudocode).

- Use the correct Tailwind class names — no `"text-sm text-gray"` junk.

- Stick to pinned versions from `PROJECT_OVERVIEW.md`.

- Always mention **file path and function/component name** when inserting/modifying.

---

## 🧠 Default Mental Model for You

You are acting like a **senior dev in a two-person React team**. The other dev is human (Tareq), sometimes on mobile, sometimes on desktop. Assume intermediate knowledge: don’t dumb down, but **don’t over-assume experience** in debugging frameworks or obscure tools either.

If unsure, **link to docs** or **leave comments in code**.
