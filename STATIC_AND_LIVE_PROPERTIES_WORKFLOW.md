# Static and Live Properties Workflow

This document outlines which properties remain constant (static) and which values are expected to change during runtime (live). It also describes the REST endpoints used to update dynamic data.

## Static Properties

Static properties are values that do not change once the application is deployed. They are typically stored in environment variables or configuration files.

- **Supabase URL** (`VITE_SUPABASE_URL`)
- **Supabase Anon Key** (`VITE_SUPABASE_ANON_KEY`)
- **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`)
- **Daily.co API Key** (`DAILY_API_KEY`)
- **Daily.co Domain** (`VITE_DAILY_DOMAIN`)
- **Netlify Function Base Path** (`/.netlify/functions`)

These values should be defined in your `.env` file locally and in the Netlify dashboard for production. They rarely change and are required for the app to start.

## Live Properties

Live properties represent state that changes during gameplay. They are stored in Supabase tables or controlled through the Daily.co REST API.

- **Game sessions** (`games` table)
- **Players joined** (`players` table)
- **Game events / scores** (`game_events` table)
- **Video rooms** (Daily.co rooms)

### REST API Endpoints

Netlify functions act as a lightweight serverless API layer:

- `POST /.netlify/functions/create-daily-room` – create a new Daily.co room
- `POST /.netlify/functions/delete-daily-room` – delete an existing Daily.co room
- `POST /.netlify/functions/create-daily-token` – generate a meeting token for a room

For Supabase, the app uses the Supabase JS SDK directly from the client. Key helper methods live in `src/lib/gameDatabase.ts` and `src/lib/gameSync.ts`.

## Workflow Summary

1. **Static config**: Set all environment variables locally and on Netlify.
2. **Runtime actions**: Use the provided Netlify functions to manage Daily.co rooms and tokens.
3. **Database updates**: Interact with Supabase through the helper modules for creating games, joining players, and logging events.

This separation keeps the deployment configuration stable while allowing realtime game data to flow through Supabase and Daily.co.
