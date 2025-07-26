> **Purpose:** This file explains the Thirty Challenge repo to an AI assistant (e.g. Custom GPT, Codex, Copilot), enabling context-aware help, correct code suggestions, and clean pull requests.

---

## 🧠 Project Identity

- **Name:** تحدي الثلاثين
    
- **Type:** Multiplayer browser quiz game (football-themed)
    
- **Stack:** Vite 5 + React 18 + Tailwind 3.5 + Supabase + Framer Motion
    
- **Host:** Netlify (static frontend), Supabase (backend)
    

---

## 📌 Core Guidelines for AI Agents

- Always **assume Node 20**, ESM only — avoid `require`, use top-level `import`.
    
- Project uses **React 18** with functional components and hooks.
    
- CSS is **Tailwind 3.5** — never suggest inline styles or styled-components.
    
- Animations use **Framer Motion 12**.
    
- State management is **React context** for now. No Redux.
    
- Realtime and DB use **Supabase JS SDK v2.19.0**.
    
- MVP must remain **< 200kB JS** — avoid bloated libraries.
    
- All logic should be **client-side only** unless explicitly asked otherwise.
    

---

## 📂 Key Files and Their Roles

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

## 📚 How to Learn from This Repo

You can analyze:

1. Any file in the repo for syntax, imports, function usage.
    
2. `PROJECT_OVERVIEW.md` to understand the structure and version choices.
    
3. `QUIZ_STRUCTURE.md` to understand the game logic and quiz segments.
    
4. GitHub issues (label: `needs-gpt`) to find prompts or request explanations.
    

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