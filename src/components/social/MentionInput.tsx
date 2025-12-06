"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { AtSign } from "lucide-react"
import { Input2035 } from "../ui/Input2035"
import { apiService } from "../../services/api"
import { useQuery } from "@tanstack/react-query"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onMention?: (userId: string, userName: string) => void
  className?: string
}

export function MentionInput({
  value,
  onChange,
  placeholder = "Type @ to mention someone...",
  onMention,
  className = "",
}: MentionInputProps) {
  const [mentionQuery, setMentionQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mentionStart, setMentionStart] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Search for users when @ is typed
  const { data: users, isLoading: searchingUsers } = useQuery({
    queryKey: ["user-search", mentionQuery],
    queryFn: async () => {
      if (!mentionQuery || mentionQuery.length < 2) return []
      const { data, error } = await apiService.search(mentionQuery, { type: "users", limit: 5 })
      if (error) throw new Error(error)
      return (data?.results || []).map((r: any) => ({
        id: r.id,
        name: r.title,
        email: r.description || "",
        avatar: r.thumbnail,
      }))
    },
    enabled: mentionQuery.length >= 2,
    staleTime: 30000,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Check for @ mentions
    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = newValue.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Check if there's a space after @ (mention ended)
      if (textAfterAt.includes(" ") || textAfterAt.includes("\n")) {
        setShowSuggestions(false)
        setMentionStart(-1)
      } else {
        setMentionStart(lastAtIndex)
        setMentionQuery(textAfterAt)
        setShowSuggestions(true)
      }
    } else {
      setShowSuggestions(false)
      setMentionStart(-1)
    }
  }

  const handleSelectUser = (user: User) => {
    if (mentionStart === -1) return

    const beforeMention = value.substring(0, mentionStart)
    const afterMention = value.substring(mentionStart).replace(/@\w*/, `@${user.name}`)
    const newValue = beforeMention + afterMention

    onChange(newValue)
    setShowSuggestions(false)
    setMentionStart(-1)
    setMentionQuery("")

    onMention?.(user.id, user.name)

    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPos = beforeMention.length + `@${user.name}`.length
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && users && users.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        // Could implement keyboard navigation here
      } else if (e.key === "Escape") {
        setShowSuggestions(false)
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Input2035
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-10"
      />
      <AtSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

      {/* Mention Suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {searchingUsers ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Searching...</div>
          ) : users && users.length > 0 ? (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">{user.name[0]?.toUpperCase() || "U"}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                    {user.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>}
                  </div>
                </button>
              ))}
            </div>
          ) : mentionQuery.length >= 2 ? (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No users found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
