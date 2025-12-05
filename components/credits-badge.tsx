"use client"

import { useAuth } from "@/lib/auth-context"
import { useCredits } from "@/hooks/use-credits"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

export function CreditsBadge() {
  const { user } = useAuth()
  const { credits } = useCredits()

  if (!user) return null

  return (
    <Badge variant={credits > 50 ? "default" : "destructive"} className="gap-1">
      <Coins className="h-3 w-3" />
      {credits}
    </Badge>
  )
}
