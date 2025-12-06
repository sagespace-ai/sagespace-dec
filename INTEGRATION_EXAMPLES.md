# Integration Examples

This document shows how to integrate the backend API with existing pages.

## Authentication Setup

### 1. Wrap App with AuthProvider

Update `src/App.tsx`:

\`\`\`typescript
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      {/* Your existing app content */}
    </AuthProvider>
  )
}
\`\`\`

### 2. Use Authentication in Components

\`\`\`typescript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
\`\`\`

## Using Feed Data

### Update HomeFeed.tsx

\`\`\`typescript
import { useFeed } from '../hooks/useFeed'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function HomeFeed() {
  const { items, loading, error, hasMore, loadMore, refresh } = useFeed()

  if (loading && items.length === 0) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
      {hasMore && (
        <button onClick={loadMore}>Load More</button>
      )}
    </div>
  )
}
\`\`\`

## Using Sages Data

### Update SagePanel.tsx

\`\`\`typescript
import { useSages } from '../hooks/useSages'
import { LoadingSpinner } from '../components/LoadingSpinner'

export default function SagePanel() {
  const { sages, loading, error, refresh, createSage } = useSages()

  const handleCreateSage = async () => {
    const newSage = await createSage({
      name: 'New Sage',
      role: 'Researcher',
      description: 'A helpful AI companion',
      avatar: 'https://...',
      memory: 'local',
      autonomy: 'advisory',
      dataAccess: 'read-only',
      color: '#FF5733',
    })

    if (newSage) {
      console.log('Sage created:', newSage)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <button onClick={handleCreateSage}>Create Sage</button>
      <button onClick={refresh}>Refresh</button>
      {sages.map(sage => (
        <div key={sage.id}>
          <h3>{sage.name}</h3>
          <p>{sage.description}</p>
        </div>
      ))}
    </div>
  )
}
\`\`\`

## Creating Feed Items

### Update CreateStudio.tsx

\`\`\`typescript
import { apiService } from '../services/api'
import { useToast } from '../contexts/ToastContext'

export default function CreateStudio() {
  const { showToast } = useToast()

  const handleCreate = async () => {
    const { data, error } = await apiService.createCreation({
      title: 'My Creation',
      type: 'image',
      description: 'A beautiful image',
      thumbnail: 'https://...',
      content_url: 'https://...',
    })

    if (error) {
      showToast('error', 'Failed to create item', error)
    } else {
      showToast('success', 'Item created successfully!')
    }
  }

  return (
    <button onClick={handleCreate}>Create</button>
  )
}
\`\`\`

## Creating Feed Interactions

\`\`\`typescript
import { apiService } from '../services/api'

async function likeItem(itemId: string) {
  const { data, error } = await apiService.createFeedInteraction({
    feed_item_id: itemId,
    interaction_type: 'like',
  })

  if (error) {
    console.error('Failed to like:', error)
  }
}

async function commentOnItem(itemId: string, comment: string) {
  const { data, error } = await apiService.createFeedInteraction({
    feed_item_id: itemId,
    interaction_type: 'comment',
    content: comment,
  })

  if (error) {
    console.error('Failed to comment:', error)
  }
}
\`\`\`

## Updating User Profile

\`\`\`typescript
import { useAuth } from '../contexts/AuthContext'
import { apiService } from '../services/api'

function ProfileSettings() {
  const { user, refreshUser } = useAuth()

  const updateProfile = async (name: string, avatar?: string) => {
    const { error } = await apiService.updateMe({ name, avatar })

    if (error) {
      console.error('Failed to update:', error)
    } else {
      await refreshUser() // Refresh user data
    }
  }

  return (
    <div>
      <p>Name: {user?.name}</p>
      <button onClick={() => updateProfile('New Name')}>
        Update Name
      </button>
    </div>
  )
}
\`\`\`

## Error Handling

\`\`\`typescript
import { handleApiError, isAuthError } from '../utils/apiHelpers'

async function fetchData() {
  try {
    const { data, error } = await apiService.getFeed()

    if (error) {
      const errorMessage = handleApiError(error)

      if (isAuthError(errorMessage)) {
        // Redirect to login
        window.location.href = '/login'
      } else {
        // Show error to user
        console.error(errorMessage)
      }
    }

    return data
  } catch (err) {
    const errorMessage = handleApiError(err)
    console.error('Unexpected error:', errorMessage)
  }
}
\`\`\`

## Environment Variables

Make sure to add these to your `.env` file:

\`\`\`env
# Supabase (for direct client access - optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API (required)
VITE_API_URL=http://localhost:3000/api
\`\`\`

## Migration Checklist

- [ ] Add `AuthProvider` to `App.tsx`
- [ ] Update `HomeFeed.tsx` to use `useFeed` hook
- [ ] Update `SagePanel.tsx` to use `useSages` hook
- [ ] Update `CreateStudio.tsx` to use `apiService.createCreation`
- [ ] Add error handling to all API calls
- [ ] Add loading states
- [ ] Test authentication flow
- [ ] Test data fetching
- [ ] Test data creation
- [ ] Test pagination
