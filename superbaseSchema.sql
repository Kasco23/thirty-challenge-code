-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.game_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id text,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_events_pkey PRIMARY KEY (id),
  CONSTRAINT game_events_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
CREATE TABLE public.games (
  id text NOT NULL,
  host_name text,
  phase text DEFAULT 'lobby'::text,
  current_segment text DEFAULT 'WSHA'::text,
  current_question_index integer DEFAULT 0,
  timer integer DEFAULT 0,
  is_timer_running boolean DEFAULT false,
  video_room_url text,
  video_room_created boolean DEFAULT false,
  segment_settings jsonb DEFAULT '{"AUCT": 8, "BELL": 12, "REMO": 5, "SING": 6, "WSHA": 10}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT games_pkey PRIMARY KEY (id)
);
CREATE TABLE public.players (
  id text NOT NULL,
  game_id text,
  name text NOT NULL,
  flag text,
  club text,
  role text DEFAULT 'playerA'::text,
  score integer DEFAULT 0,
  strikes integer DEFAULT 0,
  is_connected boolean DEFAULT true,
  special_buttons jsonb DEFAULT '{"PIT_BUTTON": true, "LOCK_BUTTON": true, "TRAVELER_BUTTON": true}'::jsonb,
  joined_at timestamp with time zone DEFAULT now(),
  last_active timestamp with time zone DEFAULT now(),
  CONSTRAINT players_pkey PRIMARY KEY (id),
  CONSTRAINT players_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
