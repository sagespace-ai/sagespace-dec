import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Zap, Users, Sparkles as SparklesIcon, TrendingUp } from 'lucide-react'
import { BreathingBackground } from '../components/motion/BreathingBackground'
import { Button2035 } from '../components/ui/Button2035'
import { useEffect, useState } from 'react'
import { FadeIn } from '../components/motion/FadeIn'
import { Card2035, Card2035Content } from '../components/ui/Card2035'
import { useAuth } from '../contexts/AuthContext'

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [videoError, setVideoError] = useState(false)

  // Only redirect if user is actually authenticated (not just a token in localStorage)
  // Wait for auth to finish loading before checking
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) {
      return
    }

    // Only redirect if we have a confirmed authenticated user
    // This ensures we don't redirect on stale tokens
    if (user) {
      navigate('/home', { replace: true })
    }
  }, [user, loading, navigate])

  // Handle video load errors gracefully
  const handleVideoError = () => {
    setVideoError(true)
  }

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI Companions',
      description: 'Interact with intelligent Sages that understand your needs'
    },
    {
      icon: Zap,
      title: 'Create & Remix',
      description: 'Transform ideas into reality with AI-powered tools'
    },
    {
      icon: Users,
      title: 'Connect & Share',
      description: 'Build your universe and share with a growing community'
    },
    {
      icon: TrendingUp,
      title: 'Discover',
      description: 'Explore content, ideas, and creations from others'
    }
  ]

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <BreathingBackground />
      {!videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          onError={handleVideoError}
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-a-woman-in-a-vr-headset-works-in-a-virtual-office-42521-large.mp4"
            type="video/mp4"
          />
        </video>
      )}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-[1]"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen text-white">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-6 md:p-8 z-20">
          <nav className="flex justify-between items-center max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded"
              aria-label="SageSpace Home"
            >
              <div className="h-10 w-10 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="SageSpace Logo"
                  className="h-10 w-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center hidden">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="font-bold text-xl text-white">SageSpace</span>
            </button>
            <ul className="flex items-center space-x-6 md:space-x-8 text-sm font-medium">
              <li>
                <button 
                  className="transition-colors hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded px-2 py-1"
                  onClick={() => {
                    const aboutSection = document.getElementById('features')
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  className="transition-colors hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white rounded px-2 py-1"
                  onClick={() => navigate('/auth/signin')}
                >
                  Sign In
                </button>
              </li>
            </ul>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center text-center px-4 py-20 md:py-32">
          <FadeIn>
            <div className="flex flex-col items-center max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold max-w-4xl leading-tight mb-6">
                Your personal AI universe for{' '}
                <span className="text-primary">work, play, and creation</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300/90 max-w-2xl mb-12">
                Connect with AI companions, create amazing content, and build your digital universe. 
                Join a community of creators shaping the future.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Button2035
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/auth/signup')}
                  className="w-full sm:w-auto group"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button2035>
                <Button2035
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/auth/signin')}
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button2035>
              </div>
              <p className="text-sm text-gray-300/70">
                Free to start • No credit card required
              </p>
            </div>
          </FadeIn>
        </main>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-20 px-4 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Everything you need to build your universe
                </h2>
                <p className="text-lg text-gray-300/80 max-w-2xl mx-auto">
                  Powerful tools and AI companions to help you create, connect, and grow
                </p>
              </div>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <FadeIn key={feature.title} delay={index * 0.1}>
                    <Card2035 className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                      onClick={() => {
                        // Check if user is actually authenticated, otherwise go to signup
                        if (user) {
                          navigate('/home')
                        } else {
                          navigate('/auth/signup')
                        }
                      }}
                    >
                      <Card2035Content className="p-6 text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-300/80">
                          {feature.description}
                        </p>
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4 text-primary mx-auto" />
                        </div>
                      </Card2035Content>
                    </Card2035>
                  </FadeIn>
                )
              })}
            </div>

            {/* Value Proposition CTA */}
            <FadeIn delay={0.4}>
              <div className="mt-16 text-center">
                <Card2035 className="max-w-3xl mx-auto bg-gradient-to-r from-primary/20 to-purple-500/20 border-primary/30">
                  <Card2035Content className="p-8">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                      Ready to build your universe?
                    </h3>
                    <p className="text-gray-300/90 mb-6">
                      Join thousands of creators using SageSpace to bring their ideas to life
                    </p>
                    <Button2035
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/auth/signup')}
                      className="group"
                    >
                      Create Your Account
                      <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button2035>
                  </Card2035Content>
                </Card2035>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 p-6 text-center text-xs text-gray-300/60 border-t border-white/10">
          <p>© 2024 SageSpace. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
