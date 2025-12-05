"use client"

import { useAuth } from "@/lib/auth-context"
import { useXP } from "@/hooks/use-xp"
import { Badge } from "@/components/ui/badge"
import { Award } from "lucide-react"

export function XpBadge() {
  const { user } = useAuth()
  const { level } = useXP()

  if (!user) return null

  return (
    <Badge variant="secondary" className="gap-1">
      <Award className="h-3 w-3" />
      Level {level}
    </Badge>
  )
}

export { XpBadge as XPBadge }
