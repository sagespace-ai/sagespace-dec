# Google Authentication Setup Guide

## Overview

SageSpace now supports Google OAuth authentication! Users can sign in or sign up using their Google account with a single click.

## What's Been Implemented

✅ **Google Sign-In Button** on Sign In page  
✅ **Google Sign-Up Button** on Sign Up page  
✅ **OAuth Callback Handler** to process Google authentication  
✅ **Automatic Profile Creation** from Google account data  
✅ **Seamless Integration** with existing authentication flow  

## User Experience

### Sign In with Google

1. User goes to `/auth/signin`
2. Clicks "Sign in with Google" button
3. Redirected to Google sign-in page
4. Selects Google account and grants permissions
5. Redirected back to SageSpace
6. Automatically signed in and redirected to `/home`

### Sign Up with Google

1. User goes to `/auth/signup`
2. Clicks "Sign up with Google" button
3. Same flow as sign-in (Google handles new vs existing users)
4. Account automatically created with Google profile data

## Supabase Configuration (Required)

### Step 1: Enable Google Provider in Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **"Google"** in the list
5. Toggle it **ON** (enable it)
6. You'll see fields for Client ID and Client Secret

### Step 2: Create Google OAuth Credentials

1. Go to https://console.cloud.google.com
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. If prompted, configure the OAuth consent screen first:
   - User Type: External (or Internal for G Suite)
   - App name: SageSpace (or your app name)
   - Support email: Your email
   - Authorized domains: Your domain (or localhost for dev)
   - Save and continue through the steps

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: SageSpace (or your choice)
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
     - Get this from Supabase → Authentication → URL Configuration
     - It should look like: `https://dvebdbopeqvtzcmasteu.supabase.co/auth/v1/callback`

7. Click **"Create"**
8. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Supabase with Google Credentials

1. Back in Supabase Dashboard → Authentication → Providers → Google
2. Paste your **Client ID** from Google Cloud Console
3. Paste your **Client Secret** from Google Cloud Console
4. Click **"Save"**

### Step 4: Configure Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Under **"Redirect URLs"**, make sure you have:
   - `http://localhost:5173/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
3. Click **"Save"**

## How It Works

### Authentication Flow

\`\`\`
1. User clicks "Sign in with Google"
   ↓
2. Frontend calls signInWithGoogle()
   ↓
3. Supabase redirects to Google OAuth
   ↓
4. User authenticates with Google
   ↓
5. Google redirects to Supabase callback
   ↓
6. Supabase redirects to /auth/callback with tokens
   ↓
7. OAuthCallback page processes tokens
   ↓
8. Session created, user profile loaded
   ↓
9. Redirect to /home
\`\`\`

### User Profile Creation

When a user signs in with Google for the first time:
- **Email**: From Google account
- **Name**: From Google profile (first + last name)
- **Avatar**: From Google profile picture (if available)
- **Account**: Automatically created in Supabase

## Code Implementation

### AuthContext Method

\`\`\`typescript
signInWithGoogle(): Promise<void>
\`\`\`

- Initiates OAuth flow
- Redirects to Google
- Handles redirect back to app

### OAuth Callback Route

- Route: `/auth/callback`
- Component: `OAuthCallback.tsx`
- Handles: Token exchange, session creation, user profile loading

## Testing

### Test Google Sign-In

1. **Make sure Supabase is configured**:
   - Google provider enabled
   - Client ID and Secret set
   - Redirect URLs configured

2. **Start your frontend**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Test the flow**:
   - Go to `/auth/signin`
   - Click "Sign in with Google"
   - Should redirect to Google
   - Sign in with Google account
   - Should redirect back and sign you in

### Common Issues

#### "Provider not enabled"
- **Fix**: Enable Google provider in Supabase Dashboard

#### "Invalid redirect URI"
- **Fix**: Check redirect URI in Google Cloud Console matches Supabase callback URL exactly

#### "OAuth callback error"
- **Fix**: 
  1. Verify redirect URL is in Supabase allowed list
  2. Check Google OAuth credentials are correct
  3. Ensure OAuth consent screen is configured

#### "No authentication tokens received"
- **Fix**: 
  1. Check browser console for errors
  2. Verify Supabase redirect URL is correct
  3. Make sure frontend is running on the correct port

## Security Considerations

### OAuth Security

1. **HTTPS Required** (for production)
   - Google OAuth requires HTTPS in production
   - Use HTTPS for your production domain

2. **Redirect URI Validation**
   - Google validates redirect URIs strictly
   - Must match exactly (including protocol, domain, path)

3. **Token Storage**
   - Tokens stored securely by Supabase
   - Session managed by Supabase client
   - No tokens exposed in frontend code

4. **Scope Management**
   - Google OAuth requests minimal scopes
   - Only email and profile information
   - No access to Google Drive, Gmail, etc.

## Production Deployment

### Environment Variables

No additional environment variables needed! Supabase handles OAuth configuration server-side.

### Required Configuration

1. **Google Cloud Console**:
   - Add production domain to authorized origins
   - Add production redirect URI
   - Update OAuth consent screen with production domain

2. **Supabase Dashboard**:
   - Add production redirect URL: `https://yourdomain.com/auth/callback`
   - Verify Google provider is enabled
   - Test OAuth flow

3. **Vercel/Deployment**:
   - No code changes needed
   - OAuth flow works automatically once Supabase is configured

## User Data from Google

When users sign in with Google, we receive:

- **Email**: Primary email address
- **Name**: Full name (first + last)
- **Avatar**: Profile picture URL (if available)
- **Email Verified**: Automatically verified (no email confirmation needed)

This data is automatically synced to the user's profile in Supabase.

## Multiple Authentication Methods

Users can:
- ✅ Sign up with email/password
- ✅ Sign in with email/password
- ✅ Sign up with Google (creates account)
- ✅ Sign in with Google (if account exists)
- ✅ Link Google to existing email account (future feature)

## Troubleshooting

### Google Sign-In Button Not Appearing

- Check that `signInWithGoogle` is imported from `useAuth()`
- Verify button is not hidden by CSS
- Check browser console for errors

### Redirect Loop

- Check redirect URLs in Supabase
- Verify callback route is configured in App.tsx
- Check that `/auth/callback` route exists

### "Provider not configured" Error

- Enable Google provider in Supabase
- Add Client ID and Secret
- Save configuration

### Google OAuth Page Shows Error

- Check Google Cloud Console for errors
- Verify OAuth consent screen is published
- Check redirect URI matches exactly

---

## Quick Start Checklist

- [ ] Enable Google provider in Supabase
- [ ] Create OAuth credentials in Google Cloud Console
- [ ] Add redirect URI to Google OAuth (Supabase callback URL)
- [ ] Configure Client ID and Secret in Supabase
- [ ] Add `/auth/callback` to Supabase redirect URLs
- [ ] Test sign-in flow
- [ ] Test sign-up flow

---

**Last Updated**: Current  
**Status**: Fully implemented and ready for configuration
