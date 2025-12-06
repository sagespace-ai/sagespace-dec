# Quick Fix: "localhost refused to connect" on Password Reset

## The Problem

When you click the reset password link from your email, you get:
- "localhost refused to connect"
- "This site can't be reached"
- Connection error

## The Solution (2 Steps)

### Step 1: Configure Supabase Redirect URL

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **"Redirect URLs"**, click **"Add URL"**
5. Add: `http://localhost:5173/auth/reset-password`
6. Click **Save**

**Also check:**
- **"Site URL"** should be: `http://localhost:5173` (for development)

### Step 2: Make Sure Frontend is Running

The reset link points to `http://localhost:5173`, so your frontend must be running:

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
\`\`\`

## Why This Happens

- Supabase sends reset links that redirect to the URL you configure
- If the redirect URL isn't in Supabase's allowed list, it won't work
- If your frontend isn't running, you'll get "connection refused"

## Test It

1. Make sure frontend is running (`npm run dev`)
2. Go to `/auth/forgot-password`
3. Enter your email
4. Check your email for the reset link
5. Click the link - should now work!

## Still Not Working?

### Check 1: Is the frontend running?
- Open `http://localhost:5173` in browser
- Should see your app

### Check 2: Is the redirect URL correct?
- In Supabase → Authentication → URL Configuration
- Make sure `http://localhost:5173/auth/reset-password` is in the list
- Check for typos (no trailing slash, correct port)

### Check 3: What URL is in the email?
- Open the reset password email
- Hover over the link (don't click)
- Check the URL at the bottom of your browser
- Should start with: `http://localhost:5173/auth/reset-password?`

### Check 4: Try requesting a new reset email
- After updating Supabase settings, request a new reset email
- The old email link might have the wrong URL cached

## Production

For production, use your actual domain:
- Site URL: `https://yourdomain.com`
- Redirect URL: `https://yourdomain.com/auth/reset-password`

---

**That's it!** After adding the redirect URL in Supabase, it should work. 🎉
