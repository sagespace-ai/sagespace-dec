# Authentication Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Browser Console
Open your browser's developer console (F12) and look for:
- Red error messages
- Supabase connection errors
- Network errors (CORS, 404, etc.)

### 2. Check Supabase Diagnostics
On the Sign In/Sign Up pages, you should see a yellow diagnostic box (development only) that shows:
- ✅ Configured: Whether environment variables are set
- ✅ Connected: Whether Supabase is reachable
- Any error messages

### 3. Verify Environment Variables
Check `.env.local` file exists and has:
\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

**Important**: After changing `.env.local`, you MUST restart the dev server!

### 4. Test Supabase Connection
1. Go to https://app.supabase.com
2. Select your project
3. Check if project is active (not paused)
4. Go to Settings → API
5. Verify the URL and anon key match your `.env.local`

## Common Issues and Solutions

### Issue: "Cannot sign up or sign in"

#### Check 1: Supabase Project Status
- Go to Supabase Dashboard
- Check if project is paused (free tier projects pause after inactivity)
- If paused, click "Restore" to reactivate

#### Check 2: Email Confirmation Settings
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth":
   - **For Development**: Disable "Enable email confirmations"
   - **For Production**: Keep enabled but ensure SMTP is configured

#### Check 3: Network/CORS Issues
- Check browser console for CORS errors
- Verify Supabase URL is correct (no typos)
- Check if you're behind a firewall/proxy blocking Supabase

#### Check 4: Environment Variables
\`\`\`bash
# In your terminal, check if variables are loaded:
echo $VITE_SUPABASE_URL  # Should show your URL
\`\`\`

If empty, the dev server needs to be restarted after setting `.env.local`

### Issue: "Invalid login credentials"

**This means the user doesn't exist in Supabase.**

**Solution**: Create the user first:
1. **Option A**: Use Sign Up page (`/auth/signup`)
2. **Option B**: Create in Supabase Dashboard:
   - Authentication → Users → Add User
   - Enter email and password
   - ✅ Check "Auto Confirm User"
   - Click "Create User"

### Issue: Sign Up Succeeds But No Session

**This means email confirmation is required.**

**Solutions**:
1. **Disable email confirmation** (for development):
   - Supabase Dashboard → Authentication → Settings
   - Email Auth → Disable "Enable email confirmations"

2. **Or check your email** for confirmation link

3. **Or manually confirm** in Supabase Dashboard:
   - Authentication → Users
   - Find your user
   - Click "..." → "Confirm email"

### Issue: "Supabase not configured"

**Check**:
1. `.env.local` file exists in project root
2. Variables start with `VITE_` (required for Vite)
3. No quotes around values
4. Dev server was restarted after adding variables

**Fix**:
\`\`\`env
# .env.local (in project root, not in src/)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

Then restart: `npm run dev`

### Issue: Network Error / CORS Error

**Possible causes**:
- Supabase project is paused
- Wrong Supabase URL
- Firewall blocking connection
- Internet connection issue

**Fix**:
1. Check Supabase Dashboard - is project active?
2. Verify URL in `.env.local` matches Dashboard
3. Try accessing Supabase URL directly in browser
4. Check network tab in browser DevTools

## Step-by-Step Debugging

### Step 1: Verify Supabase is Working
1. Open browser console (F12)
2. Go to Sign In page
3. Look for diagnostic box (yellow box at top)
4. Check if "Connected" shows ✅

### Step 2: Test Sign Up
1. Go to `/auth/signup`
2. Fill in form with test credentials
3. Click "Sign Up"
4. Check browser console for errors
5. Check for error message on page

### Step 3: Check Supabase Dashboard
1. Go to https://app.supabase.com
2. Authentication → Users
3. See if user was created
4. Check if email is confirmed

### Step 4: Test Sign In
1. If user exists and is confirmed, try signing in
2. Check console for errors
3. Verify credentials are correct

## Test Credentials Setup

### Create Test User in Supabase Dashboard:
1. Go to https://app.supabase.com
2. Authentication → Users → Add User → Create New User
3. Enter:
   - Email: `test@example.com`
   - Password: `test123456`
   - ✅ **Auto Confirm User** (MUST check this!)
4. Click "Create User"
5. Now you can sign in with these credentials

### Or Use Sign Up Page:
1. Go to `/auth/signup`
2. Enter any email and password (6+ chars)
3. Click "Sign Up"
4. If email confirmation is disabled, you'll be logged in automatically
5. If email confirmation is enabled, check your email

## Still Not Working?

### Enable Detailed Logging
Check browser console for:
- `Sign up error:` - Shows detailed error from Supabase
- `Sign in error:` - Shows detailed error from Supabase
- `Error details:` - Shows error object details

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Logs → API Logs
3. Look for authentication errors
4. Check for rate limiting or other issues

### Verify Project Settings
1. Supabase Dashboard → Settings → API
2. Verify:
   - Project URL is correct
   - Anon/public key is correct
   - Project is not paused
   - No IP restrictions blocking your IP

---

**Need More Help?**
- Check Supabase Docs: https://supabase.com/docs/guides/auth
- Check browser console for specific error messages
- Verify all environment variables are set correctly
