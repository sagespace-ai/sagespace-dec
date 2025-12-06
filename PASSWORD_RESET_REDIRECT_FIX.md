# Password Reset Redirect Fix

## Problem

When clicking the reset password link from email, you get "localhost refused to connect" error.

## Cause

The reset password link is pointing to the wrong URL. The frontend runs on `http://localhost:5173` (Vite default), but the redirect URL might be configured incorrectly.

## Solution

### Step 1: Configure Supabase Redirect URLs

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Under **"Redirect URLs"**, add:
   - `http://localhost:5173/auth/reset-password` (for development)
   - `https://yourdomain.com/auth/reset-password` (for production)

5. Click **Save**

### Step 2: Verify Frontend is Running

Make sure your frontend dev server is running:

\`\`\`bash
npm run dev
\`\`\`

It should be running on `http://localhost:5173`

### Step 3: Test the Reset Flow

1. Go to `/auth/forgot-password`
2. Enter your email
3. Check your email for the reset link
4. Click the link - it should now redirect to `http://localhost:5173/auth/reset-password`

## How It Works

The `resetPassword` function in `AuthContext.tsx` now uses:
\`\`\`typescript
const redirectUrl = `${window.location.origin}/auth/reset-password`
\`\`\`

This automatically uses the correct port (5173 for Vite dev server).

## Important Notes

- **Development**: Use `http://localhost:5173/auth/reset-password`
- **Production**: Use your actual domain (e.g., `https://sagespace.com/auth/reset-password`)
- The redirect URL **must** be added to Supabase's allowed redirect URLs
- Make sure the frontend server is running when you click the reset link

## Troubleshooting

### Still getting "refused to connect"

1. **Check Supabase Redirect URLs**:
   - Go to Authentication → URL Configuration
   - Make sure `http://localhost:5173/auth/reset-password` is in the list
   - Make sure there are no typos

2. **Check Frontend is Running**:
   - Open `http://localhost:5173` in browser
   - Should see your app

3. **Check the Email Link**:
   - Open the reset password email
   - Check what URL the link points to
   - Should be: `http://localhost:5173/auth/reset-password?access_token=...&refresh_token=...&type=recovery`

4. **Try Manual URL**:
   - Copy the tokens from the email link
   - Manually navigate to: `http://localhost:5173/auth/reset-password?access_token=TOKEN&refresh_token=TOKEN&type=recovery`

### Link points to wrong port

If the email link points to port 3000 or another port:
1. Check Supabase → Authentication → URL Configuration
2. Make sure the Site URL is set to `http://localhost:5173` (for dev)
3. Request a new reset email after updating

### Production Setup

For production, update:
1. **Supabase Site URL**: Your production domain
2. **Redirect URLs**: Add `https://yourdomain.com/auth/reset-password`
3. **Frontend Environment**: Make sure `VITE_API_URL` points to production API

---

**Last Updated**: Current  
**Status**: Fixed redirect URL to use correct frontend port
