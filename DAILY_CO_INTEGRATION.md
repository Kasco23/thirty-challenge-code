# Daily.co Integration Documentation

## Overview
This document provides a comprehensive overview of Daily.co video integration in the Thirty Challenge quiz app, including all APIs, functions, patterns, and troubleshooting information.

## Daily.co Architecture in Our App

### Core Components
1. **Netlify Functions** - Server-side Daily.co API interactions
2. **Client Libraries** - Browser SDK integration
3. **State Management** - Jotai atoms for video state
4. **React Components** - Video UI components (lobby only)

### Customized SDK Architecture
The app uses a **customized SDK approach** where video functionality is separated by role:
- **Lobby Component** - Handles all video broadcast functionality for all participants
- **Controller (ControlRoom)** - Control-only interface without video broadcast
- **This separation** simplifies code and clarifies the separation of concerns

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

## Current Implementation Status (FIXED)

### ✅ Issues Resolved

1. **Multiple Room Creation Points** - FIXED
   - **Before:** Lobby, ControlRoom, Join, and GameContext could all create rooms
   - **After:** Only Lobby (host PC) can create rooms
   - **Files affected:** All other files now have deprecated or removed room creation

2. **Video Opens in External Tabs** - FIXED
   - **Before:** Video buttons opened Daily.co in new tabs
   - **After:** UnifiedVideoRoom component properly embeds Daily.co iframe
   - **Implementation:** Modern Daily.co SDK integration with proper iframe embedding

3. **Outdated Daily.co Patterns** - FIXED
   - **Before:** Using old SDK patterns and incorrect event handling
   - **After:** Following Daily.co 2024 best practices with proper token management
   - **Component:** UnifiedVideoRoom.tsx using current Daily.co patterns

4. **Sync Conflicts** - FIXED
   - **Before:** Multiple state sources causing race conditions
   - **After:** Centralized room management with host PC as single source of truth
   - **Flow:** Host PC → creates room → broadcasts state → all participants sync

### ✅ New Architecture

**Video Integration:**
- **UnifiedVideoRoom.tsx** - Single component showing all participants
- **Participant Display** - Host + Player A + Player B in one Daily.co room
- **Embedded Experience** - No external tabs, everything in-page
- **Modern SDK Usage** - Current Daily.co best practices

**Room Management Flow:**
1. Host PC opens lobby → Auto-creates video room
2. Other participants join lobby → Use existing room
3. All participants see unified video interface
4. Only lobby can delete rooms

**URL Routing:**
- Consistent pattern: `/lobby/{gameId}?role={role}&...`
- Supported roles: `host`, `host-mobile`, `playerA`, `playerB`
- No routing conflicts affecting sync

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

### Complete Flow Test - ✅ IMPLEMENTED
- [x] 1 Host PC can create room
- [x] 1 Host Mobile can join video  
- [x] 2 Players can join video
- [x] All participants show in unified video room
- [x] Video stays embedded (no external tabs)
- [x] Room state syncs across all participants
- [x] Only lobby can create/delete rooms
- [x] No conflicting room operations

### Error Scenarios - ✅ HANDLED
- [x] Room creation failure handling
- [x] Token generation failure handling
- [x] Network disconnection recovery  
- [x] Multiple simultaneous operations prevented
- [x] Browser permission denials

## Environment Variables

Required environment variables for Daily.co integration:

```bash
# Daily.co API key (required)
DAILY_API_KEY=your_daily_api_key_here

# Daily.co custom domain (optional)
# If you have a custom Daily.co domain, set both server and client variables
DAILY_DOMAIN=thirty.daily.co
VITE_DAILY_DOMAIN=thirty.daily.co
```

### Custom Domain Configuration

If you have a custom Daily.co domain (e.g., `thirty.daily.co`):

1. **Set Environment Variables:**
   ```bash
   # Server-side (for Netlify functions)
   DAILY_DOMAIN=thirty.daily.co
   
   # Client-side (for development mode and frontend)
   VITE_DAILY_DOMAIN=thirty.daily.co
   ```

2. **Domain Format:** Use only the domain name without `https://` protocol
   - ✅ Correct: `thirty.daily.co`
   - ❌ Incorrect: `https://thirty.daily.co`

3. **Room URL Generation:**
   - **Development mode:** Mock URLs use custom domain (e.g., `https://thirty.daily.co/mock-room-{gameId}`)
   - **Production mode:** Real rooms created via Daily.co API will use custom domain URLs

4. **Verification in Netlify:**
   - Go to **Site settings > Environment variables**
   - Add both `DAILY_API_KEY` and `DAILY_DOMAIN`
   - Build logs will show: "Using custom Daily.co domain: thirty.daily.co"

## Final Implementation Details

### Key Components

#### SimpleVideoRoom.tsx
**Purpose:** Single video component showing all participants in one Daily.co room (used only in Lobby)
**Features:**
- Automatic token generation based on user role
- Proper iframe embedding with modern Daily.co SDK
- Error handling and retry logic
- Participant count tracking
- Responsive design with proper styling

#### Lobby.tsx  
**Changes:**
- Contains all video functionality for the application
- Shows unified video room with all participants (host + 2 players)
- Centralized room creation (only host PC)
- Handles video room creation, deletion, and management
- Updated instructions for unified video experience

#### ControlRoom.tsx
**Changes:**
- **REMOVED all video functionality** to create customized SDK
- No longer imports SimpleVideoRoom component
- No longer has video-related controls or display
- Control-only interface for game management
- Redirects to lobby for video-related functionality
- Simplified interface focused purely on game control

#### Deprecated Components
- **VideoRoom.tsx** - Replaced by UnifiedVideoRoom (not used)
- **VideoFrame.tsx** - Experimental component, not used
- **sharedVideoAtoms.ts** - Experimental atoms, not used

### Room Creation Flow
1. **Host PC** opens `/lobby/{gameId}?role=host`
2. **Auto-creation** triggers for host PC only
3. **Room URL** stored in database and synced via atoms
4. **Other participants** join existing room
5. **Unified video** shows all participants in one interface
6. **Controller** has no video functionality - control only

### Video Interface Distribution
- **Lobby Component** - Full video functionality for all participants
- **Controller Component** - No video functionality, control only
- **This separation** creates a customized SDK approach

### Token Management
- **Host roles** get `is_owner: true` permissions
- **Player roles** get standard participant permissions
- **Tokens expire** after 1 hour (configurable)
- **Fresh tokens** generated for each join attempt

### Sync Architecture
- **Database** as source of truth for room state
- **Jotai atoms** for local state management  
- **Real-time sync** via Supabase channels
- **Event broadcasting** for state changes

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