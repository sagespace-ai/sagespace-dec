import { useState } from 'react'
import Layout from '../components/Layout'
import { Building2, Users, Shield, Zap, Check, X } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Card2035, Card2035Header, Card2035Title, Card2035Content } from '../components/ui/Card2035'
import { Button2035 } from '../components/ui/Button2035'
import { FadeIn } from '../components/motion/FadeIn'

interface Integration {
  id: string
  name: string
  description: string
  icon: typeof Building2
  enabled: boolean
  category: 'security' | 'collaboration' | 'analytics' | 'automation'
}

const integrations: Integration[] = [
  {
    id: 'sso',
    name: 'Single Sign-On (SSO)',
    description: 'Enable enterprise authentication with SAML 2.0',
    icon: Shield,
    enabled: false,
    category: 'security',
  },
  {
    id: 'slack',
    name: 'Slack Integration',
    description: 'Connect with your Slack workspace for notifications',
    icon: Users,
    enabled: false,
    category: 'collaboration',
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Enterprise-grade analytics and reporting',
    icon: Zap,
    enabled: false,
    category: 'analytics',
  },
  {
    id: 'workflows',
    name: 'Automated Workflows',
    description: 'Set up automated workflows across your organization',
    icon: Zap,
    enabled: false,
    category: 'automation',
  },
]

export default function EnterpriseIntegration() {
  const { showToast } = useToast()
  const [integrationsState, setIntegrationsState] = useState(integrations)
  const [loading, setLoading] = useState<string | null>(null)

  const toggleIntegration = async (id: string) => {
    setLoading(id)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIntegrationsState(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    )

    const integration = integrationsState.find(i => i.id === id)
    showToast(
      `${integration?.name} ${integration?.enabled ? 'disabled' : 'enabled'} successfully`,
      integration?.enabled ? 'info' : 'success'
    )
    setLoading(null)
  }

  const categories = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'collaboration', label: 'Collaboration', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Zap },
    { id: 'automation', label: 'Automation', icon: Zap },
  ]

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white mb-2">
              Enterprise Integration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect SageSpace with your enterprise tools and services
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Integrations', value: integrationsState.filter(i => i.enabled).length },
              { label: 'Total Available', value: integrationsState.length },
              { label: 'Categories', value: 4 },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <Card2035>
                  <Card2035Content>
                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                  </Card2035Content>
                </Card2035>
              </FadeIn>
            ))}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{category.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Integrations List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Available Integrations
            </h2>
            {integrationsState.map((integration, index) => {
              const Icon = integration.icon
              const isLoading = loading === integration.id

              return (
                <FadeIn key={integration.id} delay={index * 0.1}>
                  <Card2035>
                    <Card2035Content>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-lg ${
                          integration.enabled
                            ? 'bg-primary/10 dark:bg-primary/20'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${
                            integration.enabled ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {integration.name}
                          </h3>
                          {integration.enabled && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {integration.description}
                        </p>
                        <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                          {integration.category}
                        </span>
                      </div>
                    </div>
                    <Button2035
                      variant={integration.enabled ? 'secondary' : 'primary'}
                      size="md"
                      onClick={() => toggleIntegration(integration.id)}
                      disabled={isLoading}
                      className={`ml-4 ${
                        integration.enabled
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : ''
                      }`}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : integration.enabled ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Disable
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Enable
                        </>
                      )}
                    </Button2035>
                  </div>
                    </Card2035Content>
                  </Card2035>
                </FadeIn>
              )
            })}
          </div>

          {/* Enterprise Features Info */}
          <FadeIn delay={0.5}>
            <Card2035 className="mt-8 bg-primary/10 dark:bg-primary/20 border border-primary/20">
              <Card2035Content>
                <div className="flex items-start gap-4">
                  <Building2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <Card2035Header>
                      <Card2035Title>Enterprise Features</Card2035Title>
                    </Card2035Header>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Unlock advanced features with enterprise integration. Contact your administrator
                      to enable additional integrations or request custom solutions.
                    </p>
                    <Button2035 variant="primary" size="md">
                      Contact Sales
                    </Button2035>
                  </div>
                </div>
              </Card2035Content>
            </Card2035>
          </FadeIn>
        </div>
      </div>
    </Layout>
  )
}
