# SageSpace Navigation Flow

## Page Structure

### Marketing Flow
- `/` - Landing page with hero, features, and CTA
  - Links to `/demo` (Hub)
  - Links to `/playground` (Start Chatting)
  - Links to `/marketplace` (Browse Sages)
  - Links to `/auth/login` or `/auth/signup`

### Authenticated App Flow
- `/demo` - **Main Hub/Dashboard**
  - Central navigation point
  - Shows stats, active sages, and feature cards
  - Links to all platform features
  
- `/playground` - Chat with individual sages
  - Single-sage conversations
  - Can escalate to `/council` for multi-sage perspectives
  - Can share conversations to `/multiverse`
  
- `/council` - Multi-sage deliberation
  - Get perspectives from multiple experts
  - Synthesis of different viewpoints
  
- `/memory` - Conversation history
  - Browse past conversations
  - Mood-based filtering
  - Search and replay
  
- `/multiverse` - Social feed
  - Discover shared conversations
  - Community engagement
  - Trending insights
  
- `/observatory` - Performance metrics
  - Sage analytics
  - Usage patterns
  - System health
  
- `/universe-map` - 3D spatial visualization
  - Immersive sage exploration
  - Visual relationships
  
- `/persona-editor` - Create custom sages
  - Build your own AI companions
  - Configure capabilities and personality
  
- `/marketplace` - Browse all sages
  - 300+ specialized AI agents
  - Filter by domain
  - Detailed sage profiles

### Authentication
- `/auth/login` - Demo login
- `/auth/signin` - Sign in page  
- `/auth/signup` - Sign up page

## Navigation Components

### AppNav (Desktop & Mobile Bottom Bar)
Shows on all platform pages except `/` and `/auth/*`
- Playground
- Circle (Council)
- Studio (Persona Editor)
- Memory
- Marketplace

### Page Headers
Most pages include:
- Link back to Hub (`/demo`)
- Current page title
- User menu (credits, XP, profile)

## User Journey

1. **Discovery**: Land on `/` marketing page
2. **Entry**: Click "Enter Hub" → `/demo`
3. **Explore**: Navigate to any feature from hub
4. **Engage**: Use platform features
5. **Navigate**: Use AppNav or page links to move between features

## Design Principles

- **Hub-Centric**: `/demo` is the central navigation hub
- **Contextual Navigation**: Each page provides relevant next steps
- **Persistent AppNav**: Always available (except marketing/auth)
- **Clear Hierarchy**: Home → Hub → Features
- **Easy Return**: All pages can return to hub
