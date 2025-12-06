"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { SearchIcon, X, Filter, FileText, User, Sparkles, Store } from "lucide-react"
import Layout from "../components/Layout"
import { Card2035, Card2035Content } from "../components/ui/Card2035"
import { Input2035 } from "../components/ui/Input2035"
import { Button2035 } from "../components/ui/Button2035"
import { BackButton } from "../components/navigation/BackButton"
import { FadeIn } from "../components/motion/FadeIn"
import { EmptyState } from "../components/ui/EmptyState"
import { useSearch } from "../hooks/useSearch"
import { useSearchHistory } from "../hooks/useSearchHistory"
import { FeedItemSkeleton } from "../components/ui/Skeleton"

type SearchType = "all" | "feed_item" | "user" | "sage" | "marketplace"

export default function Search() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const initialType = (searchParams.get("type") as SearchType) || "all"

  const [query, setQuery] = useState(initialQuery)
  const [searchType, setSearchType] = useState<SearchType>(initialType)
  const [showFilters, setShowFilters] = useState(false)

  const { results, total, loading, error } = useSearch(query, {
    type: searchType,
    enabled: query.length >= 2,
  })

  const { addToHistory } = useSearchHistory()

  // Add to history when search is performed
  useEffect(() => {
    if (query.length >= 2 && results.length > 0) {
      addToHistory(query)
    }
  }, [query, results.length, addToHistory])

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery)
    setSearchParams({ q: newQuery, ...(searchType !== "all" ? { type: searchType } : {}) })
  }

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type)
    setSearchParams({ q: query, ...(type !== "all" ? { type } : {}) })
  }

  const clearSearch = () => {
    setQuery("")
    setSearchParams({})
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feed_item":
        return FileText
      case "user":
        return User
      case "sage":
        return Sparkles
      case "marketplace":
        return Store
      default:
        return FileText
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "feed_item":
        return "Content"
      case "user":
        return "User"
      case "sage":
        return "Sage"
      case "marketplace":
        return "Marketplace"
      default:
        return type
    }
  }

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = []
      }
      acc[result.type].push(result)
      return acc
    },
    {} as Record<string, typeof results>,
  )

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/10 dark:border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <BackButton className="md:hidden" />
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
                  Search
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {query ? `${total} result${total !== 1 ? "s" : ""} found` : "Search across all content"}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <Card2035 className="mb-6">
            <Card2035Content>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input2035
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search content, users, sages, marketplace..."
                    className="pl-10 pr-10"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <Button2035
                  variant="secondary"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button2035>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Search in:</p>
                  <div className="flex flex-wrap gap-2">
                    {(["all", "feed_item", "user", "sage", "marketplace"] as SearchType[]).map((type) => {
                      const Icon = getTypeIcon(type)
                      return (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(type)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                            searchType === type
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {getTypeLabel(type)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card2035Content>
          </Card2035>

          {/* Results */}
          {loading && query.length >= 2 ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeedItemSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={<SearchIcon className="h-8 w-8 text-gray-400" />}
              title="Search Error"
              description={error}
              action={{
                label: "Try Again",
                onClick: () => handleSearch(query),
              }}
            />
          ) : query.length < 2 ? (
            <EmptyState
              icon={<SearchIcon className="h-8 w-8 text-gray-400" />}
              title="Start Searching"
              description="Enter at least 2 characters to search across content, users, sages, and marketplace items."
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="h-8 w-8 text-gray-400" />}
              title="No Results Found"
              description={`We couldn't find anything matching "${query}". Try different keywords or check your filters.`}
              action={{
                label: "Clear Search",
                onClick: clearSearch,
              }}
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResults).map(([type, typeResults]) => {
                const Icon = getTypeIcon(type)
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getTypeLabel(type)} ({typeResults.length})
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {typeResults.map((result, index) => (
                        <FadeIn key={result.id} delay={index * 0.05}>
                          <Card2035
                            interactive
                            onClick={() => {
                              if (result.type === "feed_item" || result.type === "content") {
                                navigate(`/home`)
                              } else if (result.type === "user") {
                                navigate(`/profile`)
                              } else if (result.type === "sage") {
                                navigate(`/sages`)
                              } else if (result.type === "marketplace") {
                                navigate(`/marketplace`)
                              }
                            }}
                          >
                            <Card2035Content>
                              <div className="flex items-start gap-4">
                                {result.thumbnail && (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                    <img
                                      src={result.thumbnail || "/placeholder.svg"}
                                      alt={result.title}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{result.title}</h3>
                                  {result.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {result.description}
                                    </p>
                                  )}
                                  <span className="inline-block mt-2 text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {getTypeLabel(result.type)}
                                  </span>
                                </div>
                              </div>
                            </Card2035Content>
                          </Card2035>
                        </FadeIn>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
