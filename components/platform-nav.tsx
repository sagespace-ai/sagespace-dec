"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HomeIcon, UserIcon, ZapIcon, AwardIcon } from "@/components/icons"

interface PlatformNavProps {
  currentPage?: string
  userStats?: {
    level: number
    xp: number
    activeNow: number
  }
}

export function PlatformNav({ currentPage, userStats }: PlatformNavProps) {
  const defaultStats = { level: 7, xp: 2850, activeNow: 47 }
  const stats = userStats || defaultStats

  const isHubPage = currentPage === "hub"

  return (
    <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400 transition-colors">
                <HomeIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            {!isHubPage && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <Link href="/hub">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400 transition-colors">
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                      Hub
                    </span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop stats */}
            <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full backdrop-blur">
              <div className="flex items-center gap-2">
                <AwardIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Level {stats.level}</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <ZapIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">{stats.xp.toLocaleString()} XP</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-300">{stats.activeNow} Active</span>
              </div>
            </div>

            {/* Mobile stats - compact */}
            <div className="flex lg:hidden items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-full">
              <AwardIcon className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-medium text-white">{stats.level}</span>
              <div className="w-px h-3 bg-white/20" />
              <ZapIcon className="w-3 h-3 text-cyan-400" />
              <span className="text-xs font-medium text-white">{stats.xp}</span>
            </div>

            <Link href="/auth/login">
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-purple-500/50"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
