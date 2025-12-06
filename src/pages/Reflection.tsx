import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Sparkles, ArrowRight, TrendingUp, Users } from 'lucide-react'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { FadeIn } from '../components/motion/FadeIn'

export default function Reflection() {
  const navigate = useNavigate()
  // const { onboardingData } = useOnboarding() // Reserved for future use

  const stats = {
    creations: 12,
    connections: 8,
    timeSpent: '4h 32m',
    topics: ['Quantum Computing', 'AI Ethics', 'Neural Networks', 'Philosophy'],
  }

  const achievements = [
    { icon: Sparkles, label: 'AI Concept Art', count: 5 },
    { icon: TrendingUp, label: 'Project Drafts', count: 3 },
    { icon: Users, label: 'Collaborations', count: 4 },
  ]

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-4">
              Session Reflection
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              A look back at what you accomplished today
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Creations', value: stats.creations },
              { label: 'Connections', value: stats.connections },
              { label: 'Time Spent', value: stats.timeSpent },
              { label: 'Topics', value: stats.topics.length },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <Card2035>
                  <Card2035Content className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </Card2035Content>
                </Card2035>
              </FadeIn>
            ))}
          </div>

          {/* Topics Explored */}
          <FadeIn delay={0.4}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title>Topics You Explored</Card2035Title>
              </Card2035Header>
              <Card2035Content>
                <div className="flex flex-wrap gap-2">
                  {stats.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* What You Brought to Life */}
          <FadeIn delay={0.5}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title>What You Brought to Life</Card2035Title>
              </Card2035Header>
              <Card2035Content>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {achievements.map((achievement, idx) => {
                    const Icon = achievement.icon
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2 text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {achievement.label}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {achievement.count} items
                        </p>
                      </div>
                    )
                  })}
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* New Connections */}
          <FadeIn delay={0.6}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title>New Connections Discovered</Card2035Title>
              </Card2035Header>
              <Card2035Content>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-1" />
                    <p className="text-gray-700 dark:text-gray-300">
                      Your Sages learned about your interest in{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Quantum Computing
                      </span>{' '}
                      and its connection to{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">Philosophy</span>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-1" />
                    <p className="text-gray-700 dark:text-gray-300">
                      A new link was identified between{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">AI Ethics</span> and
                      your work on{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Neural Networks
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Ideas for Next Time */}
          <FadeIn delay={0.7}>
            <Card2035 className="mb-6">
              <Card2035Header>
                <Card2035Title>Ideas for Next Time</Card2035Title>
              </Card2035Header>
              <Card2035Content>
                <div className="space-y-2">
                  {[
                    'Explore quantum computing applications',
                    'Deep dive into AI ethics frameworks',
                    'Create a neural network visualization',
                  ].map((idea, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <ArrowRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{idea}</span>
                    </button>
                  ))}
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.8}>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button2035
                variant="primary"
                size="lg"
                onClick={() => navigate('/home')}
                className="flex-1"
              >
                Continue Exploring
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button2035>
              <Button2035
                variant="secondary"
                size="lg"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Exit
              </Button2035>
            </div>
          </FadeIn>
        </div>
      </div>
    </Layout>
  )
}
