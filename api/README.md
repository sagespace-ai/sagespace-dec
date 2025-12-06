# SageSpace API (Next.js Backend)

This is the Next.js API backend for SageSpace, providing REST API endpoints that connect to Supabase.

## Setup

1. **Install Dependencies**:
   \`\`\`bash
   cd api
   npm install
   \`\`\`

2. **Configure Environment Variables**:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Then edit `.env.local` with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret!)

3. **Run the Development Server**:
   \`\`\`bash
   npm run dev
   \`\`\`

   The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication
All endpoints require authentication via Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

### GET /api/me
Get current user profile.

**Response**:
\`\`\`json
{
  "data": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "avatar": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

### PATCH /api/me
Update current user profile.

**Request Body**:
\`\`\`json
{
  "name": "New Name",
  "avatar": "https://..."
}
\`\`\`

### GET /api/sages
Get all sages for the current user.

**Response**:
\`\`\`json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Sage Name",
      "role": "Researcher",
      "description": "...",
      "avatar": "https://...",
      "active": true,
      "memory": "local",
      "autonomy": "advisory",
      "data_access": "...",
      "color": "#FF5733",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

### POST /api/sages
Create a new sage.

**Request Body**:
\`\`\`json
{
  "name": "Sage Name",
  "role": "Researcher",
  "description": "Description",
  "avatar": "https://...",
  "memory": "local",
  "autonomy": "advisory",
  "data_access": "...",
  "color": "#FF5733"
}
\`\`\`

### GET /api/feed
Get feed items with cursor-based pagination.

**Query Parameters**:
- `cursor` (optional): Timestamp cursor for pagination
- `limit` (optional, default: 20): Number of items to return

**Response**:
\`\`\`json
{
  "data": {
    "data": [...],
    "cursor": "2024-01-01T00:00:00Z",
    "has_more": true
  }
}
\`\`\`

### POST /api/feed/interactions
Create a feed interaction (like, comment, share, remix).

**Request Body**:
\`\`\`json
{
  "feed_item_id": "uuid",
  "interaction_type": "like",
  "content": "Comment text" // Required for comments
}
\`\`\`

### POST /api/create
Create a new feed item.

**Request Body**:
\`\`\`json
{
  "title": "Item Title",
  "type": "image",
  "description": "Description",
  "thumbnail": "https://...",
  "content_url": "https://..."
}
\`\`\`

## Integration with Frontend

The frontend API service (`src/services/api.ts`) is configured to call these endpoints. Make sure:

1. The API server is running on `http://localhost:3000`
2. Or update `VITE_API_URL` in the frontend `.env` file
3. The frontend sets the auth token in localStorage as `auth_token`

## Development

- **TypeScript**: Fully typed with shared types
- **Error Handling**: Consistent error responses
- **RLS**: All database queries respect Row Level Security
- **Authentication**: Bearer token authentication required

## Production Deployment

1. Build the API:
   \`\`\`bash
   npm run build
   \`\`\`

2. Start the production server:
   \`\`\`bash
   npm start
   \`\`\`

3. Deploy to Vercel, Railway, or your preferred platform.
