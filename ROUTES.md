# SageSpace Route Map

## Public Routes

- `/` - Landing page
- `/demo` - Hub (main dashboard after login)
- `/auth/login` - Login page
- `/auth/signup` - Signup page

## App Routes

### Core Features
- `/playground` - 1-on-1 chat with individual sages
- `/council` - Sage Circle (multi-sage deliberation)
- `/memory` - Memory Lane (conversation history)
- `/multiverse` - The Feed (social discovery)
- `/universe-map` - Sage Galaxy (3D spatial exploration)
- `/observatory` - Sage Watch (performance monitoring)
- `/persona-editor` - Sage Studio (create custom sages)

### Marketplace
- `/marketplace` - Browse all 300 sage templates
- `/marketplace/[slug]` - Individual sage detail pages (dynamic)

## API Routes

- `/api/chat` - Chat with single sage
- `/api/council` - Multi-sage deliberation
- `/api/artifacts/generate` - Generate artifacts (text/audio/image/video)
- `/api/artifacts/validate` - Validate and add provenance
- `/api/users/credits` - Check user credit balance
- `/api/users/xp` - Update user XP/level

## Status

✅ All core app routes exist
✅ Marketplace grid exists
⚠️  Marketplace detail pages need generation (see lib/sage-templates.ts)
❌ API routes need implementation
