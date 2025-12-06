import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../contexts/OnboardingContext'
import { useToast } from '../contexts/ToastContext'
import { Button2035 } from '../components/ui/Button2035'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { FadeIn } from '../components/motion/FadeIn'
import { WelcomeTour } from '../components/onboarding/WelcomeTour'

export default function GenesisChamber() {
  const navigate = useNavigate()
  const { updateGoals, updateInterests, updatePrivacy } = useOnboarding()
  const { showToast } = useToast()
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedPrivacy, setSelectedPrivacy] = useState<'private' | 'public' | null>(null)
  const [showWelcomeTour, setShowWelcomeTour] = useState(false)

  const goals = [
    { id: 'learn', label: 'Learn', icon: 'school' },
    { id: 'build', label: 'Build', icon: 'construction' },
    { id: 'heal', label: 'Heal', icon: 'healing' },
    { id: 'explore', label: 'Explore', icon: 'explore' },
  ]

  const interests = [
    { id: 'visual', label: 'Visual', icon: 'visibility' },
    { id: 'logical', label: 'Logical', icon: 'calculate' },
    { id: 'musical', label: 'Musical', icon: 'music_note' },
    { id: 'strategic', label: 'Strategic', icon: 'emoji_events' },
  ]

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    )
  }

  const handleLaunch = () => {
    if (selectedGoals.length === 0) {
      showToast('Please select at least one goal', 'warning')
      return
    }
    if (selectedInterests.length === 0) {
      showToast('Please select at least one interest', 'warning')
      return
    }
    if (!selectedPrivacy) {
      showToast('Please select a privacy preference', 'warning')
      return
    }

    updateGoals(selectedGoals)
    updateInterests(selectedInterests)
    updatePrivacy(selectedPrivacy)
    showToast('Universe created successfully!', 'success')
    // Show welcome tour instead of immediately navigating
    setShowWelcomeTour(true)
  }

  const handleTourComplete = () => {
    setShowWelcomeTour(false)
    navigate('/home')
  }

  return (
    <>
      {showWelcomeTour && <WelcomeTour onComplete={handleTourComplete} />}
      <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Genesis Chamber
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
            A few questions to shape your universe.
          </p>
        </div>

        <div className="space-y-10">
          {/* Goals Section */}
          <FadeIn>
            <Card2035>
              <Card2035Content>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What do you seek right now?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`flex flex-col items-center justify-center p-4 text-center border rounded-lg transition-all duration-200 ${
                    selectedGoals.includes(goal.id)
                      ? 'border-primary ring-2 ring-primary bg-primary/10'
                      : 'border-border-light dark:border-border-dark bg-background-light dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="material-icons-outlined text-3xl mb-2 text-gray-700 dark:text-gray-300">
                    {goal.icon}
                  </span>
                  <span className="font-medium text-base">{goal.label}</span>
                </button>
              ))}
            </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Interests Section */}
          <FadeIn delay={0.1}>
            <Card2035>
              <Card2035Content>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What shapes your curiosity?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {interests.map(interest => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex flex-col items-center justify-center p-4 text-center border rounded-lg transition-all duration-200 ${
                    selectedInterests.includes(interest.id)
                      ? 'border-primary ring-2 ring-primary bg-primary/10'
                      : 'border-border-light dark:border-border-dark bg-background-light dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="material-icons-outlined text-3xl mb-2 text-gray-700 dark:text-gray-300">
                    {interest.icon}
                  </span>
                  <span className="font-medium text-base">{interest.label}</span>
                </button>
              ))}
            </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Privacy Section */}
          <FadeIn delay={0.2}>
            <Card2035>
              <Card2035Header>
                <Card2035Title>Do you create for yourself or for the world?</Card2035Title>
              </Card2035Header>
              <Card2035Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => setSelectedPrivacy('private')}
                className={`flex items-center justify-center p-4 text-center border rounded-lg transition-all duration-200 ${
                  selectedPrivacy === 'private'
                    ? 'border-primary ring-2 ring-primary bg-primary/10'
                    : 'border-border-light dark:border-border-dark bg-background-light dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-icons-outlined text-2xl mr-3 text-gray-700 dark:text-gray-300">
                  lock
                </span>
                <span className="font-medium text-base">Private</span>
              </button>
              <button
                onClick={() => setSelectedPrivacy('public')}
                className={`flex items-center justify-center p-4 text-center border rounded-lg transition-all duration-200 ${
                  selectedPrivacy === 'public'
                    ? 'border-primary ring-2 ring-primary bg-primary/10'
                    : 'border-border-light dark:border-border-dark bg-background-light dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-icons-outlined text-2xl mr-3 text-gray-700 dark:text-gray-300">
                  public
                </span>
                <span className="font-medium text-base">Public</span>
              </button>
            </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>
        </div>

        <div className="mt-12 pt-6 border-t border-border-light dark:border-border-dark">
          <FadeIn delay={0.3}>
            <Button2035 variant="primary" size="lg" onClick={handleLaunch} className="w-full">
              Launch My Universe
            </Button2035>
          </FadeIn>
        </div>
      </main>
    </div>
    </>
  )
}
