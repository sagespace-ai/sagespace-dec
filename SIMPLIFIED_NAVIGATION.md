# SageSpace Navigation Structure

## Clear User Journey

### 1. Landing (Marketing Page) `/`
**Purpose:** Introduce SageSpace and convert visitors
- **Primary CTA:** "Start Chatting Now" → `/playground` (immediate interaction)
- **Secondary CTA:** "Meet the Sages" → `/marketplace` (explore options)
- **Top Nav:** Only "Get Started" button → `/auth/login`

### 2. Get Started `/auth/login`
**Purpose:** User authentication
- Simple login/signup flow
- Demo mode for quick try
- Redirects to `/playground` after auth

### 3. First Experience `/playground`
**Purpose:** Immediate value - chat with an AI sage
- Pre-selected sage ready to chat
- Quick demo conversation available
- Links to other features in context
- **Always accessible from AppNav**

### 4. Platform Navigation (AppNav)
**Visible on all authenticated pages:**

**Desktop (Top Bar):**
\`\`\`
[SageSpace Logo] | [💬 Playground] [🤝 Circle] [👁️ Watch] [📖 Memory] [🌊 Feed] [🌌 Galaxy] [⚡ Studio] [🏪 Browse] | [Credits] [XP] | [User Menu]
\`\`\`

**Mobile (Bottom Bar - Top 4):**
\`\`\`
[💬 Playground] [🤝 Circle] [📖 Memory] [🏪 Browse]
\`\`\`

## Page Hierarchy

### Core Features (Always in Nav)
1. **Playground** `/playground` - 1-on-1 chat with any sage
2. **Circle** `/council` - Multi-sage deliberation
3. **Watch** `/observatory` - Performance metrics & trending
4. **Memory** `/memory` - Conversation history
5. **Feed** `/multiverse` - Social discovery
6. **Galaxy** `/universe-map` - 3D sage exploration
7. **Studio** `/persona-editor` - Create custom sages
8. **Browse** `/marketplace` - Discover all sages

### Removed Confusion
- ❌ No more "/demo" page (was confusing - what's a demo vs real usage?)
- ❌ No more "Enter Hub" (every page is part of the hub)
- ❌ No dead ends - every page has clear navigation
- ✅ Marketing → Auth → Playground (clear funnel)
- ✅ Logo always goes home
- ✅ AppNav visible on all platform pages

## Navigation Principles

1. **No Dead Ends:** Every page has clear paths forward
2. **Contextual Actions:** Relevant features suggested in context
3. **Persistent Nav:** AppNav always visible (except marketing/auth)
4. **Clear Hierarchy:** Home → Get Started → Start Using
5. **Mobile-First:** Top 4 most-used features on mobile
6. **Visual Clarity:** Active page clearly highlighted

## User Flows

### New User Journey
\`\`\`
Marketing Page (/) 
  → Click "Start Chatting Now" 
  → Playground (/playground)
  → Immediately chatting with a sage
  → See "Consult Circle" button
  → Discover other features via AppNav
\`\`\`

### Returning User Journey
\`\`\`
Any page
  → AppNav always visible
  → One click to any feature
  → Logo returns home
\`\`\`

### Social Discovery Flow
\`\`\`
Playground (/playground)
  → Share to Feed button
  → Post appears in Feed (/multiverse)
  → Others discover and engage
\`\`\`

## Key Improvements

1. **Removed /demo page** - Confusing concept, now everything is "live"
2. **Direct to Playground** - First CTA goes straight to value
3. **Simplified AppNav** - All features visible, clear labels
4. **Mobile optimization** - Bottom bar with 4 key features
5. **No hidden features** - Everything accessible from nav
6. **Clear back navigation** - Logo always goes home
7. **Consistent patterns** - Same nav structure everywhere
