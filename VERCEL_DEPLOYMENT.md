# Vercel Deployment Guide

## Current Setup

This project is a **Vite + React** application, not a Next.js app. The `api/` directory contains a separate Next.js API backend that should be deployed separately.

## Deployment Options

### Option 1: Deploy Frontend Only (Recommended for now)

The frontend (Vite app) can be deployed to Vercel as a static site:

1. **Vercel Configuration**: `vercel.json` is already configured
2. **Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**:
   - Connect your GitHub repository to Vercel
   - Vercel will auto-detect the Vite configuration
   - Or manually set build settings if needed

### Option 2: Deploy API Separately

The Next.js API (`api/` directory) should be deployed as a separate Vercel project:

1. **Create New Vercel Project**:
   - Point to the same GitHub repository
   - Set **Root Directory** to `api`
   - Framework: Next.js (auto-detected)

2. **Environment Variables**:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   \`\`\`

3. **Update Frontend API URL**:
   - Set `VITE_API_URL` to your API deployment URL
   - Example: `https://sagespace-api.vercel.app/api`

### Option 3: Use Vercel Serverless Functions

Instead of deploying the Next.js API separately, you can convert the API routes to Vercel Serverless Functions:

1. Create `api/` directory in root (not the Next.js one)
2. Convert API routes to serverless functions
3. Deploy everything together

## Current Issue

Vercel is detecting the `api/` directory and trying to build it as Next.js. The `vercel.json` file tells Vercel this is a Vite project, and `.vercelignore` excludes the API directory.

## Quick Fix

If Vercel still detects Next.js:

1. **In Vercel Dashboard**:
   - Go to Project Settings
   - Under "Build & Development Settings"
   - Set Framework Preset to "Vite"
   - Set Build Command: `npm run build`
   - Set Output Directory: `dist`

2. **Or use Vercel CLI**:
   \`\`\`bash
   vercel --prod
   \`\`\`

## Environment Variables

Add these in Vercel Dashboard:

\`\`\`
VITE_API_URL=https://your-api-url.vercel.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

## Recommended Setup

1. **Deploy Frontend** (this repo, root directory)
   - Framework: Vite
   - Output: `dist`

2. **Deploy API** (separate Vercel project, `api/` directory)
   - Framework: Next.js
   - Root Directory: `api`

3. **Update Frontend**:
   - Set `VITE_API_URL` to API deployment URL

This keeps the frontend and backend separate, which is better for scaling and deployment.
