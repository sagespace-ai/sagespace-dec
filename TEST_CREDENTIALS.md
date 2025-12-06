# Test Credentials for SageSpace

## Overview
This document provides test credentials and instructions for testing the authentication system.

## Test Account Setup

### Option 1: Create Your Own Test Account
1. Navigate to the Sign Up page: `/auth/signup`
2. Fill in the form with any valid email and password (minimum 6 characters)
3. Click "Sign Up"
4. The account will be created in your Supabase project

### Option 2: Use Supabase Dashboard to Create Test User
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create New User**
4. Enter:
   - **Email**: `test@sagespace.com` (or any email)
   - **Password**: `test123456` (minimum 6 characters)
   - **Auto Confirm User**: ✅ (check this to skip email confirmation)
5. Click **Create User**

## Test Credentials (Example)

**Email**: `test@sagespace.com`  
**Password**: `test123456`

**⚠️ IMPORTANT**: These credentials will only work if you create this user in your Supabase Dashboard first!

### Quick Setup Steps:
1. Go to https://app.supabase.com → Your Project
2. Click **Authentication** → **Users**
3. Click **Add User** → **Create New User**
4. Enter:
   - Email: `test@sagespace.com`
   - Password: `test123456`
   - **✅ CHECK "Auto Confirm User"** (critical!)
5. Click **Create User**
6. Now you can sign in with these credentials

**Note**: You can use any email/password - just make sure to create the user in Supabase Dashboard first.

## Testing Authentication Flow

### 1. Sign Up Flow
1. Go to `/auth/signup`
2. Fill in:
   - Name: `Test User`
   - Email: `test@sagespace.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
3. Click "Sign Up"
4. Should redirect to `/home` with success message

### 2. Sign In Flow
1. Go to `/auth/signin`
2. Enter:
   - Email: `test@sagespace.com`
   - Password: `test123456`
3. Click "Sign In"
4. Should redirect to `/home` with "Welcome back!" message

### 3. Sign Out Flow
1. While logged in, click on your profile/avatar in the sidebar
2. Click "Sign Out"
3. Should redirect to landing page (`/`)
4. Should show "Signed out successfully" message

## Troubleshooting

### Cannot Input Text in Forms
**Fixed**: Input fields are now only disabled during form submission, not during auth initialization.

### "Supabase not configured" Error
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env.local`
- Restart the development server after setting environment variables

### "Invalid login credentials" Error

This error means the user doesn't exist or the password is incorrect. Follow these steps:

**Step 1: Create the User in Supabase Dashboard**
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User** → **Create New User**
5. Fill in:
   - **Email**: `test@sagespace.com`
   - **Password**: `test123456`
   - **Auto Confirm User**: ✅ **MUST CHECK THIS** (allows login without email confirmation)
6. Click **Create User**

**Step 2: Verify User Was Created**
- Check that the user appears in the Users list
- Verify the email is correct
- Check that "Confirmed At" has a timestamp (if Auto Confirm was checked)

**Step 3: Try Signing In Again**
- Use the exact email and password you created
- Make sure there are no extra spaces
- Try copying and pasting the credentials

**Common Issues:**
- ❌ User doesn't exist → Create user in Supabase Dashboard
- ❌ Password is wrong → Reset password in Supabase Dashboard or create new user
- ❌ Email not confirmed → Check "Auto Confirm User" when creating, or confirm email manually
- ❌ Email confirmation required → Disable in Authentication → Settings → Email Auth

### User Created But Cannot Sign In
- Check Supabase Dashboard → Authentication → Users
- Verify user email is confirmed
- Check if email confirmation is required in Supabase settings

## Supabase Configuration

### Enable Email Confirmation (Optional)
1. Go to Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", you can:
   - Enable/disable email confirmation
   - Configure email templates
   - Set up SMTP (for production)

### For Testing (Recommended)
- **Disable email confirmation** during development
- This allows immediate sign-up without email verification
- Go to: Authentication → Settings → Email Auth → Disable "Enable email confirmations"

## Environment Variables Required

\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

Get these from: Supabase Dashboard → Settings → API

---

**Last Updated**: Current  
**Status**: Ready for testing
