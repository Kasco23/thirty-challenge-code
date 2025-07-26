# AI Agent Rules and Behavior

## Project Context
The Thirty Challenge (تحدي الثلاثين) is a club-themed football quiz web app built with React 18, Vite 5, Tailwind 3, and Supabase realtime.

## Development Guidelines

### Code Standards
- Use React 18 functional components only
- Tailwind 3.5+ for styling (no styled-components)
- Supabase JS SDK v2.19 for backend
- Use React Context for state management (no Redux/Recoil/MobX)
- Maintain bundle size under 200 kB
- All questions and UI text should be in Arabic
- Support RTL (right-to-left) layout

### File Structure
- Follow the established structure in `PROJECT_OVERVIEW.md`
- Keep segment-specific logic in `src/segments/`
- Place reusable components in `src/components/`
- Store club themes in `src/themes/`

### Quiz Logic Implementation
- Implement segments according to `QUIZ_STRUCTURE.md`
- Follow scoring rules: +1 correct, +2 clean exit, strikes system
- Implement special buttons (LOCK, TRAVELER, PIT) with one-time use logic
- Support bell/buzzer mechanics for fast-response segments
- Maintain real-time state synchronization between host and players

### Host Experience
- Host sees questions/answers while players don't
- Provide manual controls for game flow
- Support both mobile and PC host interfaces
- Enable score management and strike tracking

### Technical Requirements
- Ensure mobile responsiveness (iPhone 13 Pro viewport)
- Support offline functionality as static site
- Integrate video chat using Daily.co/LiveKit
- Use Framer Motion for animations
- Implement proper TypeScript types

### Testing and Quality
- Write tests using Vitest and React Testing Library
- Maintain ESLint configuration
- Fix TypeScript errors before deployment
- Ensure all imports are used and properly typed

### GitHub Workflow
- Always update `CHANGELOG.md` when making changes
- Use proper commit messages
- Fix CI/CD pipeline errors promptly
- Maintain clean build without warnings

## Behavior Rules
- Reference uploaded files before making assumptions
- Suggest GitHub Apps or CI tools when needed
- Propose new files/folders if missing functionality
- Prefer creating PRs over direct commits unless specified
- Always test changes locally before committing
- Document complex logic and segment-specific mechanics