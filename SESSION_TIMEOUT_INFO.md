# Session Timeout Information

## Current Configuration

### Session Persistence
- **Enabled**: `persistSession: true` - Sessions are saved to localStorage
- **Auto Refresh**: `autoRefreshToken: true` - Tokens automatically refresh before expiring
- **URL Detection**: `detectSessionInUrl: true` - Detects OAuth callbacks

### Supabase Default Session Timeout

**Access Token**: 
- **Default**: 1 hour (3600 seconds) - Can be configured from 5 minutes to 1 hour
- **Auto-refreshed**: Before expiration (typically at 55 minutes)

**Refresh Token**:
- **Default**: **No expiration** (infinite) - Can be used indefinitely
- **Single use**: Each refresh token can only be used once, then a new one is issued

**Session Duration**:
- **Default**: **Indefinite** - Sessions remain active until user signs out
- **No automatic expiration**: Users stay logged in indefinitely (unless configured otherwise)
- **Auto-refresh**: Access tokens automatically refresh, keeping session active

## How It Works

### Automatic Token Refresh

1. **User signs in** → Access token (1 hour) + Refresh token (infinite) issued
2. **Token auto-refresh** → Supabase automatically refreshes access token before it expires
3. **New refresh token** → Each refresh gets a new refresh token (old one invalidated)
4. **User stays logged in** → **Indefinitely** (until they sign out or session is terminated)
5. **No automatic expiration** → Sessions persist until manual sign-out

### Session Lifecycle

\`\`\`
Sign In
  ↓
Access Token (1 hour) + Refresh Token (infinite)
  ↓
[User uses app]
  ↓
Access Token expires (after 1 hour)
  ↓
Auto-refresh triggered (at ~55 minutes)
  ↓
New Access Token (1 hour) + New Refresh Token (infinite) issued
  ↓
[Cycle continues indefinitely]
  ↓
Session remains active until:
  - User manually signs out
  - Session is terminated (if timeout configured)
  - Refresh token is revoked
\`\`\`

## Current Behavior

### What Happens

✅ **Users stay logged in indefinitely** (default Supabase behavior)  
✅ **Tokens auto-refresh** - No interruption to user experience  
✅ **Session persists** - Users remain logged in after closing browser  
✅ **No automatic expiration** - Sessions last until user signs out  
✅ **Refresh tokens don't expire** - Can be used indefinitely (single-use, but new ones issued)  

### What Doesn't Happen

❌ **No inactivity timeout** - Users don't get logged out after X minutes of inactivity  
❌ **No time-boxed sessions** - Sessions don't expire after a fixed duration (by default)  
❌ **No "remember me" option** - All sessions last indefinitely (unless configured)  

## Configuration Options

### Option 1: Keep Default (Current)

**Pros:**
- Best user experience (no interruptions)
- Users stay logged in for 30 days
- Automatic token refresh

**Cons:**
- Security risk if device is compromised
- No inactivity timeout
- Long session duration

### Option 2: Configure Session Timeout (Pro Plan Required)

Supabase Pro plans offer session controls:

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable **"Time-boxed sessions"** or **"Inactivity timeout"** (Pro plan feature)

**Available options:**
- **Time-boxed sessions**: Force logout after fixed duration (e.g., 24 hours, 7 days)
- **Inactivity timeout**: Logout after X minutes of inactivity (e.g., 15, 30, 60 minutes)
- **Single session per user**: Only most recent session active (terminates others)

**Note**: These features require a Supabase Pro plan. Free tier has unlimited sessions.

### Option 3: Add Inactivity Timeout (Custom Implementation)

This would require custom code to track user activity and log out after inactivity.

**Implementation would need:**
- Activity tracking (mouse movement, clicks, etc.)
- Timer that resets on activity
- Automatic sign-out after X minutes of inactivity
- Warning before timeout (e.g., "You'll be logged out in 1 minute")

## Security Considerations

### Current Security

✅ **HTTPS required** (in production)  
✅ **Tokens stored securely** (localStorage, not accessible to other sites)  
✅ **Auto-refresh** (prevents expired token issues)  
✅ **Supabase handles security** (industry-standard JWT tokens)  

### Potential Improvements

⚠️ **Inactivity timeout** - Log out after X minutes of inactivity  
⚠️ **Device management** - Allow users to see/revoke active sessions  
⚠️ **Remember me option** - Shorter sessions for "public" computers  
⚠️ **Session limits** - Limit number of concurrent sessions  

## Testing Session Timeout

### Test Token Refresh

1. Sign in to the app
2. Wait 1 hour (or check token expiration in browser DevTools)
3. Continue using the app
4. Should automatically refresh without interruption

### Test Session Expiration

1. Sign in to the app
2. Wait 30 days (or modify Supabase settings for testing)
3. Try to use the app
4. Should require sign-in again

### Check Current Session

\`\`\`javascript
// In browser console
const { data: { session } } = await supabase.auth.getSession()
console.log('Expires at:', new Date(session.expires_at * 1000))
console.log('Time until expiry:', (session.expires_at * 1000 - Date.now()) / 1000 / 60, 'minutes')
\`\`\`

## Supabase Settings

### Where to Configure

1. **Supabase Dashboard** → **Authentication** → **Settings**
2. Look for:
   - **JWT expiry** (access token duration)
   - **Refresh token expiry** (session duration)
   - **Session timeout** (if available)

### Default Values

- **Access Token**: 1 hour (configurable: 5 minutes to 1 hour)
- **Refresh Token**: **No expiration** (infinite, single-use)
- **Session Duration**: **Indefinite** (until sign-out or termination)
- **Auto-refresh**: Enabled (automatic)
- **Inactivity Timeout**: Disabled (can be enabled on Pro plan)
- **Time-boxed Sessions**: Disabled (can be enabled on Pro plan)

## Recommendations

### For Development
- ✅ Keep default (30 days) - Better developer experience
- ✅ No changes needed

### For Production
- ⚠️ **Recommended**: Enable time-boxed sessions (24 hours or 7 days)
- ⚠️ **Recommended**: Enable inactivity timeout (15-30 minutes)
- ⚠️ Consider single session per user (prevents multiple device access)
- ⚠️ Add "Remember me" option (shorter sessions for public devices)

### For High Security
- 🔒 Time-boxed sessions (1-24 hours)
- 🔒 Inactivity timeout (15-30 minutes)
- 🔒 Single session per user
- 🔒 Require re-authentication for sensitive actions

## Code References

### Current Configuration

**File**: `src/lib/supabase.ts`
\`\`\`typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Sessions saved to localStorage
    autoRefreshToken: true,    // Auto-refresh before expiration
    detectSessionInUrl: true,  // Handle OAuth callbacks
  },
})
\`\`\`

### Session Check

**File**: `src/contexts/AuthContext.tsx`
- Checks for existing session on app load
- Listens for auth state changes
- Automatically loads user profile when session exists

## FAQ

### Q: How long do users stay logged in?
**A**: **Indefinitely** (by default). Sessions remain active until the user signs out or session is terminated.

### Q: Do users get logged out after inactivity?
**A**: No, not by default. Sessions persist indefinitely regardless of activity. You can enable inactivity timeout on Pro plans.

### Q: Can I change the session timeout?
**A**: Yes, on Supabase Pro plans:
- Go to Authentication → Settings
- Enable "Time-boxed sessions" or "Inactivity timeout"
- Configure the duration

### Q: What happens when the session expires (if configured)?
**A**: User must sign in again. They'll be redirected to `/auth/signin` if accessing protected routes.

### Q: Does the session expire if I close the browser?
**A**: No, sessions persist in localStorage. Users remain logged in after closing/reopening browser.

### Q: Can I add inactivity timeout?
**A**: Yes, two options:
1. **Supabase Pro plan**: Enable inactivity timeout in Dashboard (recommended)
2. **Custom implementation**: Track activity and manually sign out (more complex)

---

**Last Updated**: Current  
**Status**: Using Supabase defaults (30-day sessions with auto-refresh)
