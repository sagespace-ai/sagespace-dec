import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Palette, Brain, Mic, Gauge, Lock, HelpCircle, Info } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { BackButton } from '../components/navigation/BackButton'
import { useToast } from '../contexts/ToastContext'
import { useUser } from '../contexts/UserContext'
import { FadeIn } from '../components/motion/FadeIn'
import { ErrorButton } from '../components/debug/ErrorButton'

type SettingsSection = 'visual' | 'sage' | 'voice' | 'feed' | 'privacy'

export default function Settings() {
  const { showToast } = useToast()
  const { user, updateUser } = useUser()
  const [activeSection, setActiveSection] = useState<SettingsSection>('visual')
  const [darkMode, setDarkMode] = useState(true)
  const [feedTempo, setFeedTempo] = useState(50)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [originalDarkMode, setOriginalDarkMode] = useState(true)
  const [originalFeedTempo, setOriginalFeedTempo] = useState(50)
  
  // User profile fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [originalEmail, setOriginalEmail] = useState('')
  const [originalBio, setOriginalBio] = useState('')

  useEffect(() => {
    // Load saved settings
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedFeedTempo = parseInt(localStorage.getItem('feedTempo') || '50')
    setDarkMode(savedDarkMode)
    setFeedTempo(savedFeedTempo)
    setOriginalDarkMode(savedDarkMode)
    setOriginalFeedTempo(savedFeedTempo)
  }, [])

  useEffect(() => {
    // Load user data
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setBio(user.bio)
      setOriginalName(user.name)
      setOriginalEmail(user.email)
      setOriginalBio(user.bio)
    }
  }, [user])

  useEffect(() => {
    // Track changes
    const hasSettingsChanges = darkMode !== originalDarkMode || feedTempo !== originalFeedTempo
    const hasProfileChanges = name !== originalName || email !== originalEmail || bio !== originalBio
    setHasUnsavedChanges(hasSettingsChanges || hasProfileChanges)
  }, [darkMode, feedTempo, originalDarkMode, originalFeedTempo, name, email, bio, originalName, originalEmail, originalBio])

  const handleSave = () => {
    // Save settings
    localStorage.setItem('darkMode', darkMode.toString())
    localStorage.setItem('feedTempo', feedTempo.toString())
    setOriginalDarkMode(darkMode)
    setOriginalFeedTempo(feedTempo)
    
    // Save user profile
    if (user) {
      updateUser({
        name,
        email,
        bio,
      })
      setOriginalName(name)
      setOriginalEmail(email)
      setOriginalBio(bio)
    }
    
    setHasUnsavedChanges(false)
    showToast('Settings saved successfully', 'success')
  }

  const handleDiscard = () => {
    setDarkMode(originalDarkMode)
    setFeedTempo(originalFeedTempo)
    if (user) {
      setName(originalName)
      setEmail(originalEmail)
      setBio(originalBio)
    }
    setHasUnsavedChanges(false)
    showToast('Changes discarded', 'info')
  }

  const sections = [
    { id: 'visual' as SettingsSection, label: 'Visual Identity', icon: Palette },
    { id: 'sage' as SettingsSection, label: 'Sage Behavior', icon: Brain },
    { id: 'voice' as SettingsSection, label: 'Voice & Interaction', icon: Mic },
    { id: 'feed' as SettingsSection, label: 'Feed Tempo', icon: Gauge },
    { id: 'privacy' as SettingsSection, label: 'Privacy & Data', icon: Lock },
  ]

  return (
    <Layout>
      <div className="flex h-full">
        {/* Side Navigation */}
        <aside className="flex-shrink-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-center px-2 py-4">
                {user ? (
                  <>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-primary/20"
                    />
                    <div className="flex flex-col">
                      <h1 className="text-gray-800 dark:text-white text-base font-medium">
                        {user.name}
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex flex-col gap-1">
                      <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {sections.map(section => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                          : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-800 dark:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <p className="text-sm font-medium">{section.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-800 dark:text-white">
                <HelpCircle className="h-5 w-5" />
                <p className="text-sm font-medium">HelpCircle Center</p>
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800/50 text-gray-800 dark:text-white">
                <Info className="h-5 w-5" />
                <p className="text-sm font-medium">About</p>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <BackButton className="md:hidden" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Settings & System Controls
                </h1>
              </div>
              {hasUnsavedChanges && (
                <div className="flex gap-2">
                  <Button2035 variant="ghost" size="sm" onClick={handleDiscard}>
                    Discard
                  </Button2035>
                  <Button2035 variant="primary" size="sm" onClick={handleSave}>
                    Save Changes
                  </Button2035>
                </div>
              )}
            </div>

            {/* Visual Identity Section */}
            {activeSection === 'visual' && (
              <FadeIn>
                <div className="space-y-6">
                  <Card2035>
                    <Card2035Content>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Theme Preferences
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Toggle between light and dark themes
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={darkMode}
                              onChange={e => {
                                setDarkMode(e.target.checked)
                                // Apply immediately for better UX
                                if (e.target.checked) {
                                  document.documentElement.classList.add('dark')
                                } else {
                                  document.documentElement.classList.remove('dark')
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 dark:text-white font-medium">Accent Color</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Choose your primary color
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'].map(color => (
                              <button
                                key={color}
                                className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: color }}
                              ></button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card2035Content>
                </Card2035>
              </div>
            </FadeIn>
            )}

            {/* Sage Behavior Section */}
            {activeSection === 'sage' && (
              <FadeIn>
                <div className="space-y-6">
                  <Card2035>
                    <Card2035Header>
                      <Card2035Title>AI Companion Behavior</Card2035Title>
                    </Card2035Header>
                    <Card2035Content>
                      <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Default Autonomy Level
                      </label>
                      <select className="w-full bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white">
                        <option>Advisory</option>
                        <option>Semi-Autonomous</option>
                        <option>Autonomous</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Memory Scope
                      </label>
                      <select className="w-full bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white">
                        <option>Local</option>
                        <option>Cross-session</option>
                        <option>Global</option>
                      </select>
                    </div>
                      </div>
                    </Card2035Content>
                  </Card2035>
                </div>
              </FadeIn>
            )}

            {/* Feed Tempo Section */}
            {activeSection === 'feed' && (
              <FadeIn>
                <div className="space-y-6">
                  <Card2035>
                    <Card2035Header>
                      <Card2035Title>Feed Tempo</Card2035Title>
                    </Card2035Header>
                    <Card2035Content>
                      <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-900 dark:text-white">
                          Content Refresh Rate
                        </label>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feedTempo}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={feedTempo}
                        onChange={e => setFeedTempo(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>
                      </div>
                    </Card2035Content>
                  </Card2035>
                </div>
              </FadeIn>
            )}

            {/* Privacy & Data Section */}
            {activeSection === 'privacy' && (
              <FadeIn>
                <div className="space-y-6">
                  <Card2035>
                    <Card2035Header>
                      <Card2035Title>Privacy & Data</Card2035Title>
                    </Card2035Header>
                    <Card2035Content>
                      <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          Data Collection
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Allow anonymous usage data collection
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div>
                      <Button2035 variant="primary" size="md" className="bg-red-600 hover:bg-red-700">
                        Delete All Data
                      </Button2035>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="mb-2">
                        <p className="text-gray-900 dark:text-white font-medium">
                          Sentry Error Testing
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Test Sentry error tracking (for development only)
                        </p>
                      </div>
                      <ErrorButton />
                    </div>
                      </div>
                    </Card2035Content>
                  </Card2035>
                </div>
              </FadeIn>
            )}

            {/* Voice & Interaction Section */}
            {activeSection === 'voice' && (
              <FadeIn>
                <div className="space-y-6">
                  <Card2035>
                    <Card2035Header>
                      <Card2035Title>Voice & Interaction</Card2035Title>
                    </Card2035Header>
                    <Card2035Content>
                      <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">Voice Commands</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable voice interaction with Sages
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                      </div>
                    </Card2035Content>
                  </Card2035>
                </div>
              </FadeIn>
            )}
          </div>
        </main>
      </div>
    </Layout>
  )
}
