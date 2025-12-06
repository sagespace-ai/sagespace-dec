# Real-Time Features Implementation

## Overview

Real-time features have been implemented using Supabase Realtime subscriptions. This allows the application to automatically update when data changes in the database, providing a live, responsive experience.

## Features Implemented

### 1. Real-Time Feed Updates (`useRealtimeFeed`)

**Location**: `src/hooks/useRealtimeFeed.ts`

**Features**:
- Subscribes to `feed_items` table changes (INSERT, UPDATE, DELETE)
- Subscribes to `feed_interactions` table changes
- Automatically invalidates React Query cache to trigger refetch
- Optimistically adds new items to the feed cache

**Usage**:
\`\`\`typescript
import { useRealtimeFeed } from '../hooks/useRealtimeFeed'
import { useAuth } from '../contexts/AuthContext'

const { user } = useAuth()
useRealtimeFeed({
  userId: user?.id,
  enabled: !!user,
})
\`\`\`

**Integration**: Integrated into `src/pages/HomeFeed.tsx`

### 2. Real-Time Notifications (`useRealtimeNotifications`)

**Location**: `src/hooks/useRealtimeNotifications.ts`

**Features**:
- Subscribes to `feed_interactions` table for new interactions
- Shows toast notifications when user's posts receive interactions
- Automatically invalidates notifications query cache
- Filters notifications to only show interactions on user's own items

**Usage**:
\`\`\`typescript
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import { useAuth } from '../contexts/AuthContext'

const { user } = useAuth()
useRealtimeNotifications({
  userId: user?.id,
  enabled: !!user,
  showToasts: true, // Set to false if already on notifications page
})
\`\`\`

**Integration**: Integrated into `src/pages/Notifications.tsx`

### 3. Real-Time Conversations (`useRealtimeConversations`)

**Location**: `src/hooks/useRealtimeConversations.ts`

**Features**:
- Subscribes to `conversations` table changes
- Subscribes to `messages` table changes for the current conversation
- Automatically invalidates conversation queries to reload messages
- Updates conversation list when new conversations are created

**Usage**:
\`\`\`typescript
import { useRealtimeConversations } from '../hooks/useRealtimeConversations'
import { useAuth } from '../contexts/AuthContext'

const { user } = useAuth()
useRealtimeConversations({
  userId: user?.id,
  conversationId: currentConversationId,
  enabled: !!user,
})
\`\`\`

**Integration**: Integrated into `src/pages/SagePanel.tsx`

## How It Works

1. **Supabase Realtime**: Uses Supabase's built-in realtime capabilities via WebSocket connections
2. **PostgreSQL Changes**: Listens to database changes using PostgreSQL's logical replication
3. **React Query Integration**: Automatically invalidates React Query caches when changes occur
4. **Automatic Cleanup**: Subscriptions are cleaned up when components unmount

## Database Setup

To enable realtime for tables, you need to add them to Supabase's realtime publication. This is typically done via the Supabase dashboard or SQL:

\`\`\`sql
-- Enable Realtime for feed_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_items;

-- Enable Realtime for feed_interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_interactions;

-- Enable Realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
\`\`\`

**Note**: These commands are commented out in the migration files. Uncomment them when deploying to production, or run them manually in the Supabase SQL Editor.

## Benefits

1. **Live Updates**: Feed items appear immediately when created
2. **Instant Notifications**: Users see interactions on their posts in real-time
3. **Live Chat**: Messages appear instantly in Sage conversations
4. **Better UX**: No need to manually refresh pages
5. **Efficient**: Only updates when data actually changes

## Performance Considerations

- Subscriptions are only active when components are mounted
- Subscriptions are automatically cleaned up on unmount
- React Query caching prevents unnecessary refetches
- Filters ensure only relevant data is subscribed to

## Future Enhancements

1. **Optimistic Updates**: Add items to cache immediately before server confirmation
2. **Presence**: Show when users are online/typing
3. **Typing Indicators**: Show when Sages are "thinking"
4. **Read Receipts**: Show when messages are read
5. **Connection Status**: Show connection status indicator

## Troubleshooting

If real-time updates aren't working:

1. **Check Supabase Realtime**: Ensure tables are added to the realtime publication
2. **Check RLS Policies**: Ensure Row Level Security allows the user to see the data
3. **Check Network**: Ensure WebSocket connections aren't blocked
4. **Check Console**: Look for subscription errors in the browser console
5. **Check Auth**: Ensure user is authenticated (subscriptions require auth)
