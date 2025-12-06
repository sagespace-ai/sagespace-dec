# Password Reset Flow Guide

## Overview

SageSpace now has a complete password reset flow that allows users to:
1. Request a password reset email
2. Click the link in their email
3. Set a new password

**Note**: Since authentication is email-based, there is no separate "forgot username" feature - the email address IS the username.

## User Flow

### 1. Request Password Reset

1. User goes to `/auth/signin`
2. Clicks "Forgot password?" link below the password field
3. Or navigates directly to `/auth/forgot-password`
4. Enters their email address
5. Clicks "Send Reset Link"
6. Receives confirmation that email was sent

### 2. Reset Password

1. User receives email with reset link
2. Clicks the link (redirects to `/auth/reset-password` with tokens)
3. Enters new password (minimum 6 characters)
4. Confirms new password
5. Clicks "Reset Password"
6. Gets success message and is redirected to sign in

## Routes

- `/auth/forgot-password` - Request password reset
- `/auth/reset-password` - Set new password (accessed via email link)

## Supabase Configuration

### Required Settings

1. **Site URL** (IMPORTANT):
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set **"Site URL"** to:
     - For development: `http://localhost:5173`
     - For production: `https://yourdomain.com`

2. **Redirect URLs** (REQUIRED):
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Under **"Redirect URLs"**, add:
     - For development: `http://localhost:5173/auth/reset-password`
     - For production: `https://yourdomain.com/auth/reset-password`
   - **Important**: The redirect URL must match exactly, including the port number!

3. **Email Templates**:
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Ensure "Reset Password" template is configured
   - The reset link will use the redirect URL you configured above

3. **SMTP Settings** (for production):
   - Go to Supabase Dashboard → Authentication → Settings
   - Configure SMTP settings if you want to send emails from your own domain
   - Otherwise, Supabase uses their default email service

### Email Template Variables

The reset password email template can use these variables:
- `{{ .ConfirmationURL }}` - The reset link URL
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Reset token (usually not needed)

## Implementation Details

### AuthContext Methods

\`\`\`typescript
// Request password reset email
resetPassword(email: string): Promise<void>

// Update password (after clicking reset link)
updatePassword(newPassword: string): Promise<void>
\`\`\`

### Security Features

1. **Token Validation**: The reset link tokens are validated before allowing password reset
2. **Session Management**: Supabase creates a temporary session when the reset link is clicked
3. **Password Requirements**: Minimum 6 characters (enforced by Supabase)
4. **Rate Limiting**: Supabase automatically rate limits password reset requests

### Error Handling

The flow handles these error cases:
- Invalid or expired reset token
- Missing reset token in URL
- Password too short
- Passwords don't match
- Network errors
- Rate limiting

## Testing

### Test Password Reset Flow

1. **Request Reset**:
   \`\`\`
   Navigate to: /auth/forgot-password
   Enter: test@sagespace.com
   Click: "Send Reset Link"
   \`\`\`

2. **Check Email**:
   - Check your email inbox (or spam folder)
   - Look for email from Supabase
   - Click the reset link

3. **Reset Password**:
   - Should redirect to `/auth/reset-password`
   - Enter new password
   - Confirm password
   - Click "Reset Password"

4. **Sign In**:
   - Should redirect to `/auth/signin`
   - Sign in with new password

### Development Testing

If emails aren't being sent (common in development):

1. **Check Supabase Dashboard**:
   - Go to Authentication → Users
   - Find your test user
   - Check if there are any email delivery errors

2. **Manual Testing**:
   - You can manually trigger password reset from Supabase Dashboard
   - Or use Supabase API directly for testing

3. **Disable Email Confirmation** (for testing):
   - This doesn't affect password reset, but helps with overall auth testing
   - Go to Authentication → Settings → Email Auth
   - Disable "Enable email confirmations"

## Troubleshooting

### "Invalid or missing reset token"

**Causes**:
- Reset link expired (usually expires after 1 hour)
- Reset link was already used
- URL parameters are missing

**Solution**:
- Request a new password reset link
- Make sure you're clicking the full link from the email

### "This reset link has expired"

**Causes**:
- Token expired (Supabase default is 1 hour)
- Token was already used

**Solution**:
- Request a new password reset
- Check email for the most recent reset link

### Email Not Received

**Causes**:
- SMTP not configured (Supabase uses default service)
- Email in spam folder
- Email address doesn't exist in system

**Solution**:
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase Dashboard → Authentication → Users for delivery status
4. Configure SMTP in Supabase Settings for production

### Redirect URL Mismatch

**Causes**:
- Domain not added to Supabase redirect URLs
- Using wrong domain (localhost vs production)

**Solution**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your domain to "Redirect URLs"
3. Include both `http://localhost:5173` (dev) and production domain

## API Reference

### resetPassword(email: string)

Sends a password reset email to the specified address.

**Parameters**:
- `email` (string): User's email address

**Returns**: `Promise<void>`

**Throws**:
- Error if Supabase not configured
- Error if email is empty
- Error if rate limited
- Error if email sending fails

### updatePassword(newPassword: string)

Updates the user's password. Must be called after clicking the reset link.

**Parameters**:
- `newPassword` (string): New password (minimum 6 characters)

**Returns**: `Promise<void>`

**Throws**:
- Error if Supabase not configured
- Error if password too short
- Error if session expired
- Error if password update fails

---

**Last Updated**: Current  
**Status**: Fully implemented and ready for use
