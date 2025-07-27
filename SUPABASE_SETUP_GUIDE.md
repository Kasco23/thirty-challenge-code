# 🚀 SUPABASE REAL-TIME SETUP GUIDE

## 📋 **OVERVIEW**
This guide will help you set up Supabase real-time functionality for the Thirty Challenge quiz game, including database tables, Row Level Security (RLS) policies, and real-time subscriptions.

---

## 🔧 **STEP 1: DATABASE SETUP**

### 1.1 Create Tables and Policies
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content from `supabase_setup.sql` (created above)
3. Click **Run** to execute all commands

This will create:
- ✅ `games` table (game sessions)
- ✅ `players` table (participants)  
- ✅ `game_events` table (activity log)
- ✅ RLS policies (security rules)
- ✅ Indexes (performance optimization)
- ✅ Triggers (automatic timestamps)

### 1.2 Verify Tables Created
Go to **Database** → **Tables** and confirm you see:
- `games`
- `players` 
- `game_events`

---

## 📡 **STEP 2: ENABLE REAL-TIME**

### 2.1 Enable Real-time Replication
1. Go to **Database** → **Replication**
2. Find the **Source** section
3. Toggle ON the following tables:
   - ✅ `games`
   - ✅ `players`
   - ✅ `game_events`

### 2.2 Verify Real-time Status
Each table should show:
- **Status**: `Enabled`
- **Replication**: `All columns`

---

## 🔐 **STEP 3: ROW LEVEL SECURITY (RLS)**

### 3.1 Understanding the RLS Setup
The SQL script already configured these policies:

**Games Table:**
- Anyone can read, create, update, delete games
- Suitable for a public quiz game

**Players Table:**
- Anyone can read, create, update, delete players
- Players can join/leave freely

**Game Events Table:**
- Anyone can read and create events
- Provides activity logging

### 3.2 Verify RLS Policies
1. Go to **Authentication** → **Policies**
2. Confirm policies exist for each table
3. Status should show **Enabled** for RLS

---

## 🌐 **STEP 4: ENVIRONMENT VARIABLES**

### 4.1 Get Your Supabase Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Service role key** (for server-side operations)

### 4.2 Update Your .env File
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Daily.co Configuration (if using video)
DAILY_API_KEY=your_daily_api_key_here
VITE_DAILY_DOMAIN=your-daily-domain.daily.co
```

### 4.3 Netlify Environment Variables
Add these in **Netlify Dashboard** → **Site Settings** → **Environment Variables**:

| Variable | Value | Contains Secret |
|----------|-------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase URL | ❌ No |
| `VITE_SUPABASE_ANON_KEY` | Your anon key | ❌ No |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | ✅ Yes |
| `DAILY_API_KEY` | Your Daily.co key | ✅ Yes |
| `VITE_DAILY_DOMAIN` | Your Daily.co domain | ❌ No |

---

## 🧪 **STEP 5: TEST THE SETUP**

### 5.1 Test Database Connection
Run this in your browser console on your deployed site:
```javascript
// Check if Supabase is configured
console.log('Supabase configured:', window.location.href.includes('localhost') ? 'Check .env file' : 'Check Netlify env vars');
```

### 5.2 Test Real-time Functionality
1. Open your game in two browser tabs
2. Create a game session in one tab
3. Join the game in the second tab
4. Verify that both tabs update in real-time

### 5.3 Test Database Operations
In **Supabase Dashboard** → **Table Editor**:
1. Manually insert a test game:
   ```sql
   INSERT INTO games (id, host_name) VALUES ('TEST123', 'Test Host');
   ```
2. Check if it appears in your application
3. Delete the test data when done

---

## 🚨 **TROUBLESHOOTING**

### Problem: "No data will be selectable via Supabase APIs"
**Solution**: This means RLS is enabled but no policies exist. The SQL script should have created policies. If not:

1. Go to **Authentication** → **Policies**
2. Create a policy for each table:
   ```sql
   CREATE POLICY "Enable all operations" ON games FOR ALL USING (true);
   CREATE POLICY "Enable all operations" ON players FOR ALL USING (true);
   CREATE POLICY "Enable all operations" ON game_events FOR ALL USING (true);
   ```

### Problem: Real-time not working
**Checklist**:
- ✅ Tables enabled in **Database** → **Replication**
- ✅ Environment variables correct
- ✅ No browser console errors
- ✅ Network connection stable

### Problem: "Failed to create subscription"
**Solutions**:
- Check your anon key is correct
- Verify your Supabase URL format
- Ensure RLS policies allow access
- Check browser network tab for 403/401 errors

### Problem: Players not syncing between devices
**Debug steps**:
1. Open browser dev tools
2. Check **Network** tab for Supabase requests
3. Look for WebSocket connections
4. Verify real-time subscriptions are active

---

## 📊 **MONITORING & ANALYTICS**

### Database Usage
Monitor in **Settings** → **Usage**:
- Database size
- API requests
- Real-time connections

### Real-time Connections
Check **Database** → **Replication** for:
- Active subscriptions
- Message throughput
- Connection errors

---

## 🔄 **NEXT STEPS**

After completing this setup:

1. **Test the complete flow**: Create → Join → Play
2. **Monitor performance**: Check real-time latency
3. **Add error handling**: Graceful fallbacks if Supabase is down
4. **Scale considerations**: Plan for concurrent games

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Review browser console for errors
3. Test with simple SQL queries first
4. Verify all environment variables are set correctly

The setup is now complete! Your quiz game should have full real-time synchronization between all participants. 🎉