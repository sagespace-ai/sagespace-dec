/**
 * useSearchHistory Hook
 * 
 * Manages search history in localStorage
 */

import { useState, useEffect } from 'react'

const SEARCH_HISTORY_KEY = 'sagespace_search_history'
const MAX_HISTORY_ITEMS = 10

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    // Load history from localStorage
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [])

  const addToHistory = (query: string) => {
    if (!query.trim() || query.length < 2) return

    setHistory((prev) => {
      // Remove duplicate and add to front
      const filtered = prev.filter((item) => item.toLowerCase() !== query.toLowerCase())
      const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS)

      // Save to localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }

      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }

  const removeFromHistory = (query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item !== query)
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to update search history:', error)
      }
      return updated
    })
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  }
}
