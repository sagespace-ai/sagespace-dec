/**
 * Application Constants
 */

// App Info
export const APP_NAME = 'SageSpace'
export const APP_VERSION = '1.0.0'

// Routes
export const ROUTES = {
  HOME: '/home',
  ONBOARDING: '/onboarding',
  SAGES: '/sages',
  CREATE: '/create',
  MARKETPLACE: '/marketplace',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  UNIVERSE: '/universe',
  REMIX: '/remix',
  REFLECTION: '/reflection',
  ENTERPRISE: '/enterprise',
} as const

// Media Types
export const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
  SIMULATION: 'simulation',
} as const

// Sage Roles
export const SAGE_ROLES = {
  RESEARCHER: 'Researcher',
  BUILDER: 'Builder',
  ANALYST: 'Analyst',
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  CREATION: 'creation',
  SOCIAL: 'social',
  SYSTEM: 'system',
  MARKETPLACE: 'marketplace',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  DARK_MODE: 'darkMode',
  ONBOARDING_DATA: 'onboardingData',
  USER_PREFERENCES: 'userPreferences',
} as const

// API Endpoints (when backend is ready)
export const API_ENDPOINTS = {
  USERS: '/users',
  CREATIONS: '/creations',
  SAGES: '/sages',
  MARKETPLACE: '/marketplace',
  NOTIFICATIONS: '/notifications',
} as const

// Toast Durations
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const

// Debounce Delays
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  INPUT: 500,
} as const
