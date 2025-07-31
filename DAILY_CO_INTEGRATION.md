# Daily.co Integration Documentation

## Overview
This document provides a comprehensive overview of Daily.co video integration in the Thirty Challenge quiz app, including all APIs, functions, patterns, and troubleshooting information.

## Daily.co Architecture in Our App

### Core Components
1. **Netlify Functions** - Server-side Daily.co API interactions
2. **Client Libraries** - Browser SDK integration
3. **State Management** - Jotai atoms for video state
4. **React Components** - Video UI components

## Netlify Functions (Server-side)

### 1. create-daily-room.ts
**Purpose:** Creates a new Daily.co room
**Endpoint:** `/.netlify/functions/create-daily-room`
**Method:** POST

```typescript
// Request payload
{
  roomName: string,
  properties?: {
    max_participants?: number,
    enable_screenshare?: boolean,
    enable_chat?: boolean,
    start_video_off?: boolean,
    start_audio_off?: boolean
  }
}

// Response
{
  roomName: string,
  url: string,
  created: string
}
```

**Daily.co API Used:** `POST https://api.daily.co/v1/rooms`

### 2. create-daily-token.ts
**Purpose:** Generates meeting tokens for room access
**Endpoint:** `/.netlify/functions/create-daily-token`
**Method:** POST

```typescript
// Request payload
{
  room: string,
  user: string,
  isHost: boolean
}

// Response
{
  token: string
}
```

**Daily.co API Used:** `POST https://api.daily.co/v1/meeting-tokens`

### 3. delete-daily-room.ts
**Purpose:** Deletes a Daily.co room
**Endpoint:** `/.netlify/functions/delete-daily-room`
**Method:** POST

```typescript
// Request payload
{
  roomName: string
}
```

**Daily.co API Used:** `DELETE https://api.daily.co/v1/rooms/{roomName}`

## Client-side Integration

### Daily.co SDK Lazy Loading
**File:** `src/lib/dailyLazy.ts`

```typescript
// Key functions
export async function createCall(): Promise<DailyCall>
export async function joinRoom(call: DailyCall, roomUrl: string, token?: string, userName?: string): Promise<void>
export async function leaveRoom(call: DailyCall): Promise<void>
```

### State Management (Jotai Atoms)
**File:** `src/state/videoAtoms.ts`

```typescript
// Core atoms
export const dailyCallAtom = atom<DailyCall | null>(null);
export const meetingStateAtom = atom<string>('new');
export const participantsAtom = atom<Record<string, DailyParticipant>>({});

// Action atoms
export const joinVideoRoomAtom = atom(null, async (get, set, params) => {...});
export const leaveVideoRoomAtom = atom(null, async (get, set) => {...});
```

### Video Component
**File:** `src/components/VideoRoom.tsx`

**Props:**
```typescript
interface VideoRoomProps {
  gameId: string;
  userName: string;
  userRole: 'host-mobile' | 'playerA' | 'playerB';
  className?: string;
}
```

## Current Issues and Problems

### 1. Multiple Room Creation Points
**Problem:** Multiple files can create Daily.co rooms simultaneously
**Files affected:**
- `src/pages/Lobby.tsx` (auto-creation for both host and players)
- `src/pages/ControlRoom.tsx` (manual creation)
- `src/pages/Join.tsx` (auto-creation for players)
- `src/context/GameContext.tsx` (legacy context)

**Solution needed:** Centralize room creation only in Lobby

### 2. Video Opens in External Tabs
**Problem:** Video buttons open Daily.co in new tabs instead of embedding
**Root cause:** Incorrect iframe handling and token usage
**Files affected:** `src/components/VideoRoom.tsx`

### 3. Outdated Daily.co Patterns
**Problem:** Using old Daily.co SDK patterns not matching current documentation
**Issues:**
- Improper iframe embedding
- Incorrect event handling
- Token management issues

### 4. Sync Conflicts
**Problem:** Video room state gets out of sync between participants
**Root causes:**
- Multiple state sources (atoms, database, real-time)
- Race conditions in room creation
- Inconsistent state updates

## Daily.co Best Practices (Current 2024)

### 1. Room Creation
```typescript
// Recommended pattern
const room = await fetch('https://api.daily.co/v1/rooms', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: roomName,
    properties: {
      max_participants: 10,
      enable_screenshare: true,
      enable_chat: true,
      exp: Math.round(Date.now() / 1000) + 3600 // 1 hour expiry
    }
  })
});
```

### 2. Token Generation
```typescript
// Recommended pattern
const token = await fetch('https://api.daily.co/v1/meeting-tokens', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    properties: {
      room_name: roomName,
      user_name: userName,
      is_owner: isHost,
      exp: Math.round(Date.now() / 1000) + 3600
    }
  })
});
```

### 3. Client-side Embedding
```typescript
// Recommended pattern for React
import DailyIframe from '@daily-co/daily-js';

const callObject = DailyIframe.createCallObject({
  iframeStyle: {
    position: 'relative',
    width: '100%',
    height: '100%'
  }
});

// Join with token
await callObject.join({
  url: roomUrl,
  token: meetingToken
});

// Embed in React component
const iframe = callObject.iframe();
containerRef.current?.appendChild(iframe);
```

## Recommended Architecture

### Single Room Management Flow
1. **Host PC opens Lobby** → Auto-creates room
2. **Other participants join Lobby** → Use existing room
3. **Only Lobby can delete rooms** → Prevent conflicts

### State Sync Pattern
1. **Room creation** → Update database → Broadcast to all
2. **State changes** → Local atoms → Database → Real-time sync
3. **Video events** → Handle locally → Optional broadcast

### URL Routing Pattern
```
/lobby/{gameId}?role=host              # Host PC (control only)
/lobby/{gameId}?role=host-mobile       # Host Mobile (with video)
/lobby/{gameId}?role=playerA           # Player A
/lobby/{gameId}?role=playerB           # Player B
```

## Testing Checklist

### Complete Flow Test
- [ ] 1 Host PC can create room
- [ ] 1 Host Mobile can join video
- [ ] 2 Players can join video
- [ ] All 3 video frames show in lobby
- [ ] Video stays embedded (no external tabs)
- [ ] Room state syncs across all participants
- [ ] Only lobby can create/delete rooms
- [ ] No conflicting room operations

### Error Scenarios
- [ ] Room creation failure handling
- [ ] Token generation failure handling
- [ ] Network disconnection recovery
- [ ] Multiple simultaneous operations
- [ ] Browser permission denials

## Environment Variables

Required environment variables for Daily.co integration:

```bash
DAILY_API_KEY=your_daily_api_key_here
```

## Daily.co Resources

- **Official Documentation:** https://docs.daily.co/
- **API Reference:** https://docs.daily.co/reference
- **React SDK Guide:** https://docs.daily.co/guides/products/react
- **Meeting Tokens:** https://docs.daily.co/guides/security/meeting-tokens
- **Room Management:** https://docs.daily.co/guides/products/rooms

## Troubleshooting

### Common Issues

1. **"Failed to join room"**
   - Check room URL validity
   - Verify token hasn't expired
   - Ensure room still exists

2. **Video opens in new tab**
   - Check iframe embedding code
   - Verify container DOM element exists
   - Review token permissions

3. **Multiple rooms created**
   - Check for race conditions
   - Verify only one creation point
   - Review auto-creation logic

4. **Participants can't see each other**
   - Check token permissions
   - Verify room configuration
   - Review video/audio settings