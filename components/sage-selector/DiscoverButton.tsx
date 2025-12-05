"use client"

import type { Mood } from "@/types/sage-selector"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface DiscoverButtonProps {
  disabled: boolean
  loading: boolean
  onClick: () => void
  mood: Mood | null
}

export function DiscoverButton({ disabled, loading, onClick, mood }: DiscoverButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {loading ? (
        <>
          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Discovering...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-5 w-5" />
          SPIN TO DISCOVER
        </>
      )}
    </Button>
  )
}
