import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Filter, Grid3x3, List, Sparkles, TrendingUp, Users, Clock } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { Card2035, Card2035Content } from '../components/ui/Card2035'
import { EmptyState } from '../components/ui/EmptyState'
import { BackButton } from '../components/navigation/BackButton'
import { FadeIn } from '../components/motion/FadeIn'

interface UniverseNode {
  id: string
  title: string
  type: 'creation' | 'sage' | 'project' | 'connection'
  connections: number
  lastActive: string
  color: string
}

const universeNodes: UniverseNode[] = [
  {
    id: '1',
    title: 'Quantum Computing Research',
    type: 'project',
    connections: 12,
    lastActive: '2h ago',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    title: 'AI Art Collection',
    type: 'creation',
    connections: 8,
    lastActive: '5h ago',
    color: 'bg-purple-500',
  },
  {
    id: '3',
    title: 'Athena Sage',
    type: 'sage',
    connections: 15,
    lastActive: '1h ago',
    color: 'bg-indigo-500',
  },
  {
    id: '4',
    title: 'Marketing Campaign',
    type: 'project',
    connections: 6,
    lastActive: '1d ago',
    color: 'bg-green-500',
  },
  {
    id: '5',
    title: 'Neural Network Visualization',
    type: 'creation',
    connections: 20,
    lastActive: '30m ago',
    color: 'bg-pink-500',
  },
]

export default function UniverseMap() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return universeNodes
    const query = searchQuery.toLowerCase()
    return universeNodes.filter(
      node =>
        node.title.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/10 dark:border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <BackButton className="md:hidden" />
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                  Universe Map
                </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Explore your interconnected universe of creations, projects, and connections
              </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <SearchBar
                placeholder="Search your universe..."
                onSearch={setSearchQuery}
                className="w-full"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Content */}
          {filteredNodes.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="h-12 w-12 text-gray-400 dark:text-gray-600" />}
              title={searchQuery ? 'No nodes found' : 'Your universe is empty'}
              description={
                searchQuery
                  ? `No nodes match "${searchQuery}". Try a different search term.`
                  : 'Start building your universe by creating content, connecting with Sages, or exploring the marketplace.'
              }
              action={
                searchQuery
                  ? {
                      label: 'Clear Search',
                      onClick: () => setSearchQuery(''),
                    }
                  : {
                      label: 'Create Your First Item',
                      onClick: () => navigate('/create'),
                    }
              }
              secondaryAction={
                searchQuery
                  ? undefined
                  : {
                      label: 'Explore Marketplace',
                      onClick: () => navigate('/marketplace'),
                    }
              }
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNodes.map((node, index) => (
                <FadeIn key={node.id} delay={index * 0.05}>
                  <Card2035 interactive>
                    <Card2035Content>
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`${node.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                    >
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {node.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {node.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{node.connections} connections</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{node.lastActive}</span>
                    </div>
                  </div>
                </Card2035Content>
                </Card2035>
              </FadeIn>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNodes.map((node, index) => (
                <FadeIn key={node.id} delay={index * 0.05}>
                  <Card2035 interactive>
                    <Card2035Content>
                      <div className="flex items-center gap-4">
                    <div
                      className={`${node.color} w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                        {node.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-2">
                        {node.type}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{node.connections} connections</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{node.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                    </Card2035Content>
                  </Card2035>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
