import { createContext, useContext, useState, ReactNode } from 'react'

interface OnboardingData {
  goals: string[]
  interests: string[]
  privacy: 'private' | 'public' | null
}

interface OnboardingContextType {
  onboardingData: OnboardingData
  updateGoals: (goals: string[]) => void
  updateInterests: (interests: string[]) => void
  updatePrivacy: (privacy: 'private' | 'public') => void
  reset: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    goals: [],
    interests: [],
    privacy: null,
  })

  const updateGoals = (goals: string[]) => {
    setOnboardingData(prev => ({ ...prev, goals }))
  }

  const updateInterests = (interests: string[]) => {
    setOnboardingData(prev => ({ ...prev, interests }))
  }

  const updatePrivacy = (privacy: 'private' | 'public') => {
    setOnboardingData(prev => ({ ...prev, privacy }))
  }

  const reset = () => {
    setOnboardingData({ goals: [], interests: [], privacy: null })
  }

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateGoals,
        updateInterests,
        updatePrivacy,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
