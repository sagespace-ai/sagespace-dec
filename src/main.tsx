import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

// Initialize Sentry with error handling
try {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || "https://d138f17fa7085c8a547f3c1f826581f4@o4510353287675904.ingest.us.sentry.io/4510461526540288",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    environment: import.meta.env.MODE || 'development',
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
} catch (error) {
  console.warn('Failed to initialize Sentry:', error)
  // Continue without Sentry - app should still work
}

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(container)

// Wrap render in error handling to prevent crashes
try {
  root.render(
    <React.StrictMode>
      {/* PHASE 2: Wrap app with React Query client for server state management */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  // Render a minimal error UI
  root.render(
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Unable to load SageSpace</h1>
      <p>Please refresh the page or contact support if the problem persists.</p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  )
}
