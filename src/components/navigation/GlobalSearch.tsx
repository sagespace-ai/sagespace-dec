"use client"

import type React from "react"

/**
 * Global Search Component
 *
 * A persistent search bar that appears at the top of the app
 * Provides quick access to search functionality from anywhere
 */

import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { SearchIcon, X, Command } from "lucide-react"
import { useSearch } from "../../hooks/useSearch"
import { useSearchHistory } from "../../hooks/useSearchHistory"
import { Card2035, Card2035Content } from "../ui/Card2035"
import { Input2035 } from "../ui/Input2035"
import { FadeIn } from "../motion/FadeIn"
import { cn } from "../../lib/utils"

export function GlobalSearch() {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, loading } = useSearch(query, {
    type: "all",
    enabled: query.length >= 2 && isExpanded,
  })

  const { history, addToHistory } = useSearchHistory()

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    if (showResults) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showResults])

  // Keyboard shortcut: Cmd/Ctrl + Shift + K (Cmd/Ctrl + K is used by QuickNavMenu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Cmd/Ctrl + Shift + K for global search
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "k") {
        e.preventDefault()
        setIsExpanded(true)
        setShowResults(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      // Also allow Cmd/Ctrl + K if QuickNavMenu is not handling it
      // (QuickNavMenu will handle it first, but if search is already open, focus it)
      if ((e.metaKey || e.ctrlKey) && e.key === "k" && !e.shiftKey && isExpanded) {
        e.preventDefault()
        inputRef.current?.focus()
      }
      // Escape to close
      if (e.key === "Escape" && (isExpanded || showResults)) {
        setIsExpanded(false)
        setShowResults(false)
        setQuery("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isExpanded, showResults])

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isExpanded])

  // Navigate to search page when Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      addToHistory(query)
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setIsExpanded(false)
      setShowResults(false)
      setQuery("")
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value.length >= 2) {
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  const handleResultClick = (result: any) => {
    addToHistory(query)
    if (result.type === "feed_item" || result.type === "content") {
      navigate(`/home`)
    } else if (result.type === "user") {
      navigate(`/profile/${result.id}`)
    } else if (result.type === "sage") {
      navigate(`/sages`)
    } else if (result.type === "marketplace") {
      navigate(`/marketplace`)
    }
    setIsExpanded(false)
    setShowResults(false)
    setQuery("")
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    navigate(`/search?q=${encodeURIComponent(historyQuery)}`)
    setIsExpanded(false)
    setShowResults(false)
  }

  const clearSearch = () => {
    setQuery("")
    setShowResults(false)
    inputRef.current?.focus()
  }

  // Don't show on auth pages, landing page, or search page itself
  const hiddenPaths = [
    "/search",
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/callback",
  ]
  if (hiddenPaths.includes(location.pathname)) {
    return null
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Compact Search Bar - Always Visible */}
      <div className="w-full">
        <div
          className={cn(
            "relative flex items-center transition-all duration-200",
            isExpanded
              ? "w-full bg-white dark:bg-gray-800 border-2 border-primary rounded-lg shadow-lg"
              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 cursor-pointer",
          )}
          onClick={() => {
            if (!isExpanded) {
              setIsExpanded(true)
              setShowResults(true)
            }
          }}
        >
          {isExpanded ? (
            <>
              <SearchIcon className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input2035
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search content, users, sages, marketplace..."
                className="pl-10 pr-10 py-2 border-0 bg-transparent focus:ring-0"
                autoFocus
              />
              {query && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearSearch()
                  }}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </>
          ) : (
            <>
              <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-3 flex-1 text-left">
                Search content, users, sages, marketplace...
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                <Command className="h-3 w-3" />
                <span>⇧K</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isExpanded && showResults && (
        <FadeIn>
          <Card2035 className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[600px] overflow-y-auto shadow-xl">
            <Card2035Content className="p-0">
              {/* Search History */}
              {query.length < 2 && history.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {history.slice(0, 5).map((historyQuery, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(historyQuery)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <SearchIcon className="h-4 w-4 text-gray-400" />
                        {historyQuery}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {query.length < 2 && (
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Quick Actions
                  </h3>
                  <button
                    onClick={() => {
                      navigate("/search")
                      setIsExpanded(false)
                      setShowResults(false)
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <SearchIcon className="h-4 w-4 text-gray-400" />
                    Go to Search Page
                  </button>
                </div>
              )}

              {/* Search Results */}
              {query.length >= 2 && (
                <div className="p-4">
                  {loading ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <p className="mt-2 text-sm">Searching...</p>
                    </div>
                  ) : results.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                      <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No results found</p>
                      <button
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(query)}`)
                          setIsExpanded(false)
                          setShowResults(false)
                        }}
                        className="mt-4 text-sm text-primary hover:underline"
                      >
                        View all results
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Results ({results.length})
                        </h3>
                        <button
                          onClick={() => {
                            navigate(`/search?q=${encodeURIComponent(query)}`)
                            setIsExpanded(false)
                            setShowResults(false)
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[400px] overflow-y-auto">
                        {results.slice(0, 8).map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {result.thumbnail && (
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                  <img
                                    src={result.thumbnail || "/placeholder.svg"}
                                    alt={result.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {result.title}
                                </p>
                                {result.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                    {result.description}
                                  </p>
                                )}
                                <span className="inline-block mt-1 text-xs text-gray-400 dark:text-gray-500">
                                  {result.type === "feed_item" || result.type === "content"
                                    ? "Content"
                                    : result.type === "user"
                                      ? "User"
                                      : result.type === "sage"
                                        ? "Sage"
                                        : result.type === "marketplace"
                                          ? "Marketplace"
                                          : result.type}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card2035Content>
          </Card2035>
        </FadeIn>
      )}
    </div>
  )
}
