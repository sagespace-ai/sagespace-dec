"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SageSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SageSearchBar({ value, onChange }: SageSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
      <Input
        type="text"
        placeholder="Quick search sages..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-slate-900/50 border-cyan-500/30 text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20"
      />
    </div>
  )
}
