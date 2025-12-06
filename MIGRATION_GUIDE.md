# Migration Guide: Integrating Backend API

This guide helps you migrate existing pages to use the new backend API.

## Step 1: Install Dependencies

\`\`\`bash
npm install @supabase/supabase-js
\`\`\`

## Step 2: Add Environment Variables

Create or update `.env`:

\`\`\`env
# Supabase (optional - for direct client access)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API (required)
VITE_API_URL=http://localhost:3000/api
\`\`\`

## Step 3: Update App.tsx

Add `AuthProvider` to wrap your app:

\`\`\`typescript
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Your routes */}
      </Router>
    </AuthProvider>
  )
}
\`\`\`

## Step 4: Update Pages

### HomeFeed.tsx

**Before:**
\`\`\`typescript
const [items, setItems] = useState([])
// Mock data
\`\`\`

**After:**
\`\`\`typescript
import { useFeed } from '../hooks/useFeed'

export default function HomeFeed() {
  const { items, loading, error, hasMore, loadMore, refresh } = useFeed()
  
  // items are automatically loaded
  // Use loading, error, hasMore, loadMore, refresh as needed
}
\`\`\`

### SagePanel.tsx

**Before:**
\`\`\`typescript
const [sages, setSages] = useState([])
// Mock data
\`\`\`

**After:**
\`\`\`typescript
import { useSages } from '../hooks/useSages'

export default function SagePanel() {
  const { sages, loading, error, refresh, createSage } = useSages()
  
  // sages are automatically loaded
}
\`\`\`

### CreateStudio.tsx

**Before:**
\`\`\`typescript
const handleGenerate = () => {
  // Mock creation
}
\`\`\`

**After:**
\`\`\`typescript
import { apiService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

export default function CreateStudio() {
  const { showToast } = useToast()

  const handleGenerate = async () => {
    const { data, error } = await apiService.createCreation({
      title: prompt,
      type: selectedType,
      description: description,
    })

    if (error) {
      showToast('error', 'Failed to create', error)
    } else {
      showToast('success', 'Created successfully!')
    }
  }
}
\`\`\`

## Step 5: Add Protected Routes

For pages that require authentication:

\`\`\`typescript
import ProtectedRoute from '../components/ProtectedRoute'

<Route
  path="/home"
  element={
    <ProtectedRoute>
      <HomeFeed />
    </ProtectedRoute>
  }
/>
\`\`\`

## Step 6: Add Authentication UI

Create a login/signup page:

\`\`\`typescript
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async () => {
    try {
      await signIn(email, password)
      // Redirect to home
    } catch (error) {
      // Show error
    }
  }

  return (
    <form onSubmit={handleSignIn}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        Sign In
      </button>
    </form>
  )
}
\`\`\`

## Step 7: Test Integration

1. **Start API Server**:
   \`\`\`bash
   cd api
   npm run dev
   \`\`\`

2. **Start Frontend**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Test Flow**:
   - Sign up / Sign in
   - View feed (should load from API)
   - View sages (should load from API)
   - Create item (should save to database)
   - Check Supabase dashboard to verify data

## Common Issues

### 401 Unauthorized
- Check that auth token is set: `localStorage.getItem('auth_token')`
- Verify user is signed in via Supabase Auth
- Check API server is running

### CORS Errors
- Verify `VITE_API_URL` matches API server URL
- Check `api/next.config.js` CORS settings

### Data Not Loading
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Check API server logs

### Types Mismatch
- Database uses snake_case (created_at)
- Frontend uses camelCase (createdAt)
- Hooks automatically transform data

## Next Steps

1. Add real-time subscriptions for live updates
2. Add file uploads for images/videos
3. Add search and filtering
4. Add notifications system
5. Add marketplace integration

## Files Created

- `src/lib/supabase.ts` - Supabase client
- `src/contexts/AuthContext.tsx` - Auth context
- `src/hooks/useFeed.ts` - Feed hook
- `src/hooks/useSages.ts` - Sages hook
- `src/utils/apiHelpers.ts` - Helper utilities
- `src/components/ProtectedRoute.tsx` - Route protection

See `INTEGRATION_EXAMPLES.md` for detailed code examples.
