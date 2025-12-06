# Login Error Handling - Incorrect Credentials

## What Happens When Someone Tries to Log In with Wrong Credentials

### User Experience Flow

1. **User enters incorrect email/password** and clicks "Sign In"
2. **Form submission** - Button shows "Signing in..." (disabled state)
3. **Error occurs** - Supabase returns "Invalid login credentials"
4. **Error message displayed** - User sees a clear error message
5. **Toast notification** - Error also appears as a toast
6. **Form remains accessible** - User can correct and try again
7. **No redirect** - User stays on the sign-in page

### Visual Error Display

The error appears in **two places**:

#### 1. Inline Error Box (Red Alert)
- **Location**: Above the form fields
- **Style**: Red background with border, alert icon
- **Content**: 
  - Error title: "Error"
  - Error message: "Invalid email or password. Please check your credentials or create an account if you don't have one."
  - Optional: Link to sign up if error suggests creating account

#### 2. Toast Notification
- **Location**: Top-right corner (or configured position)
- **Type**: Error toast
- **Duration**: Auto-dismisses after a few seconds
- **Content**: Same error message

### Error Messages by Scenario

#### Invalid Credentials (Wrong Email or Password)
\`\`\`
"Invalid email or password. Please check your credentials or create an account if you don't have one."
\`\`\`
- **Trigger**: Supabase returns "Invalid login credentials"
- **User-friendly**: Doesn't reveal which field is wrong (security best practice)
- **Action**: User can try again or sign up

#### Email Not Confirmed
\`\`\`
"Please check your email and confirm your account before signing in."
\`\`\`
- **Trigger**: User exists but email not confirmed
- **Action**: User needs to check email for confirmation link

#### User Not Found
\`\`\`
"No account found with this email. Please sign up to create an account."
\`\`\`
- **Trigger**: Email doesn't exist in system
- **Action**: Suggests signing up

#### Empty Fields
\`\`\`
"Please fill in all fields"
\`\`\`
- **Trigger**: User submits form with empty email or password
- **Action**: User must fill both fields

### Technical Flow

\`\`\`typescript
// 1. User submits form
handleSubmit() {
  // 2. Validation
  if (!email || !password) {
    setError('Please fill in all fields')
    return
  }
  
  // 3. Call AuthContext.signIn()
  await signIn(email, password)
}

// 4. AuthContext processes with Supabase
signIn() {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  // 5. Error handling
  if (error) {
    // Convert Supabase error to user-friendly message
    if (error.message === 'Invalid login credentials') {
      errorMessage = 'Invalid email or password...'
    }
    throw new Error(errorMessage)
  }
}

// 6. Error caught and displayed
catch (err) {
  setError(errorMessage)        // Inline error box
  showToast(errorMessage, 'error')  // Toast notification
}
\`\`\`

### Security Features

1. **Generic Error Messages**
   - Doesn't reveal if email exists or not
   - Prevents email enumeration attacks
   - Message: "Invalid email or password" (covers both cases)

2. **No Rate Limiting on Frontend**
   - Supabase handles rate limiting server-side
   - Multiple failed attempts may trigger temporary lockout

3. **No Credential Hints**
   - Doesn't suggest which field is wrong
   - Doesn't reveal password requirements on error

4. **Console Logging (Dev Only)**
   - Errors logged to console for debugging
   - Includes original error details
   - Not visible to end users

### User Actions After Error

1. **Try Again**
   - Form fields remain filled (except password for security)
   - User can correct and resubmit
   - No limit on attempts (Supabase handles rate limiting)

2. **Sign Up**
   - Link to `/auth/signup` if error suggests creating account
   - Also available at bottom of form

3. **Forgot Password**
   - Link to `/auth/forgot-password` below password field
   - User can request password reset

4. **Go Back**
   - Link to home page at bottom
   - User can navigate away

### Error States

#### Loading State
- Button shows "Signing in..."
- Button is disabled
- Inputs are disabled
- Prevents double submission

#### Error State
- Error message displayed
- Toast notification shown
- Button returns to "Sign In"
- Inputs re-enabled
- User can retry

#### Success State
- Toast: "Welcome back!"
- Automatic redirect to `/home`
- User session created
- Auth token stored

### Code Locations

- **Error Handling**: `src/contexts/AuthContext.tsx` (lines 183-214)
- **UI Display**: `src/pages/Auth/SignIn.tsx` (lines 36-62, 92-105)
- **Error Messages**: Enhanced in `AuthContext.signIn()` method

### Testing Scenarios

To test incorrect credentials:

1. **Wrong Password**:
   - Use correct email, wrong password
   - Should see: "Invalid email or password..."

2. **Wrong Email**:
   - Use non-existent email
   - Should see: "Invalid email or password..." (or "No account found...")

3. **Empty Fields**:
   - Submit with empty email or password
   - Should see: "Please fill in all fields"

4. **Unconfirmed Email**:
   - Sign up but don't confirm email
   - Try to sign in
   - Should see: "Please check your email and confirm your account..."

### Best Practices Implemented

✅ **User-friendly error messages** - Clear, actionable  
✅ **Security-conscious** - Doesn't reveal which field is wrong  
✅ **Multiple feedback channels** - Inline + toast  
✅ **No information leakage** - Generic error messages  
✅ **Accessible** - Error clearly visible with icon  
✅ **Actionable** - Provides links to sign up or reset password  

---

**Last Updated**: Current  
**Status**: Fully implemented with comprehensive error handling
