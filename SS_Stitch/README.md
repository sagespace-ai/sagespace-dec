# SS_Stitch - Remix Feature

## Overview

SS_Stitch is a creative synthesis engine that combines two distinct inputs (text and/or images) into a single, novel output. This feature is now integrated into SageSpace as the "Remix" feature.

## What SS_Stitch Does

SS_Stitch uses Google's Gemini AI to:
1. **Analyze** two separate inputs (Input A and Input B)
2. **Synthesize** them into a cohesive new concept
3. **Generate** a title, synthesis paragraph, and visual prompt
4. **Optionally** generate an image based on the synthesis

## Current Implementation

### Standalone App
The `SS_Stitch/` folder contains a standalone Vite application that demonstrates the core functionality:
- `App.tsx` - Main application component
- `components/InputCard.tsx` - Input card for text/image input
- `components/ResultView.tsx` - Result display component
- `components/HistorySidebar.tsx` - History management
- `services/gemini.ts` - Gemini API integration
- `services/history.ts` - Local storage history service
- `types.ts` - TypeScript type definitions

### SageSpace Integration

The Remix feature has been integrated into SageSpace:

#### Frontend
- **Page**: `src/pages/Remix.tsx` - Main Remix page
- **Components**: 
  - `src/components/remix/RemixInputCard.tsx` - Input card using design system
  - `src/components/remix/RemixResultView.tsx` - Result display
- **Hook**: `src/hooks/useRemixStitch.ts` - React Query hook for API calls
- **Types**: `src/types/remix.ts` - TypeScript definitions

#### Backend
- **API Endpoint**: `api/pages/api/remix.ts` - POST endpoint for remix generation
- **API Service**: `src/services/api.ts` - Frontend API client method

#### Navigation
- Accessible via `/remix` route
- Available in sidebar navigation (Remix icon)
- Can be invoked from CreateStudio or feed items

## How to Use

### As a User

1. Navigate to `/remix` or click "Remix" in the sidebar
2. Fill in **Input A** (text and/or image)
3. Fill in **Input B** (text and/or image)
4. Select a **Mode**:
   - **Concept Blend**: Focus on blending core concepts
   - **Image Blend**: Focus on visual synthesis
   - **Idea Generation**: Generate new ideas from the combination
5. Click **Remix** to generate
6. View the result with title, synthesis, and optional image
7. Use "New Remix" to start over or "Remix Again" to regenerate

### From Context

You can also invoke Remix with pre-populated inputs:
- From CreateStudio: Click "Remix" button
- From Feed: Select two items and choose "Remix Together"

## API Usage

### Endpoint
\`\`\`
POST /api/remix
\`\`\`

### Request Body
\`\`\`typescript
{
  inputA: {
    text?: string
    imageUrl?: string
    metadata?: any
  }
  inputB: {
    text?: string
    imageUrl?: string
    metadata?: any
  }
  mode?: 'concept_blend' | 'image_blend' | 'idea_generation'
  extraContext?: Record<string, any>
}
\`\`\`

### Response
\`\`\`typescript
{
  data: {
    title: string
    synthesis: string
    resultText?: string
    resultImageUrl?: string
    visualPrompt?: string
    debugInfo?: any
  }
}
\`\`\`

### Frontend Hook
\`\`\`typescript
import { useRemixStitch } from '../hooks/useRemixStitch'

const { remix, isLoading, error, data } = useRemixStitch()

await remix({
  inputA: { text: 'Quantum computing' },
  inputB: { text: 'Artistic expression' },
  mode: 'concept_blend'
})
\`\`\`

## Development

### Prerequisites
- Node.js
- Gemini API key (set as `GEMINI_API_KEY` environment variable)

### Local Development

1. **Backend API**:
   \`\`\`bash
   cd api
   npm install
   # Add GEMINI_API_KEY (not NEXT_PUBLIC_) to .env.local
   npm run dev
   \`\`\`

2. **Frontend**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

3. **Standalone SS_Stitch** (optional):
   \`\`\`bash
   cd SS_Stitch
   npm install
   # Add GEMINI_API_KEY to .env.local
   npm run dev
   \`\`\`

## Architecture Notes

- **Design System**: Remix UI uses Card2035, Button2035, Input2035 for consistency
- **State Management**: React Query for server state, local state for UI
- **Error Handling**: Graceful degradation (text-only if image generation fails)
- **History**: LocalStorage-based history (in standalone app)
- **Integration**: Can accept pre-populated inputs via navigation state

## Future Enhancements

- [ ] Save remixes to feed as new creations
- [ ] Multi-item remix (3+ inputs)
- [ ] Remix templates/presets
- [ ] Collaborative remixing
- [ ] Remix history in SageSpace (not just localStorage)
- [ ] Integration with Sages/Orbits for context-aware remixing
