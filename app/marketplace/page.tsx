"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HomeIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/icons"
import { SAGE_TEMPLATES, getAllDomains, getSagesByDomain } from "@/lib/sage-templates"

export default function MarketplacePage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24

  const domains = getAllDomains()
  const displaySages = selectedDomain ? getSagesByDomain(selectedDomain) : SAGE_TEMPLATES

  const totalPages = Math.ceil(displaySages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSages = displaySages.slice(startIndex, endIndex)

  // Reset to page 1 when domain filter changes
  const handleDomainChange = (domain: string | null) => {
    setSelectedDomain(domain)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2 animate-pulse">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                Discover Your Perfect Sage
              </span>
            </h1>
            <p className="text-xl text-slate-300 font-light">
              <span className="text-cyan-400 font-semibold">{displaySages.length}</span> specialized AI minds waiting to
              join your universe
            </p>
          </div>
          <Link href="/playground">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <HomeIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => handleDomainChange(null)}
            variant={selectedDomain === null ? "default" : "outline"}
            size="sm"
            className={
              selectedDomain === null
                ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-cyan-500/50"
                : "border-2 border-cyan-400/50 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-400/10 bg-slate-800/50 backdrop-blur-sm"
            }
          >
            All ({SAGE_TEMPLATES.length})
          </Button>
          {domains.map((domain) => (
            <Button
              key={domain}
              onClick={() => handleDomainChange(domain)}
              variant={selectedDomain === domain ? "default" : "outline"}
              size="sm"
              className={
                selectedDomain === domain
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-purple-500/50"
                  : "border-2 border-cyan-400/50 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-400/10 bg-slate-800/50 backdrop-blur-sm"
              }
            >
              {domain} ({getSagesByDomain(domain).length})
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {paginatedSages.map((sage, idx) => (
            <Link key={sage.id} href={`/marketplace/${sage.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
              <Card
                className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm p-4 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer group animate-fade-in"
                style={{
                  animationDelay: `${idx * 0.05}s`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{sage.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                      {sage.name}
                    </h3>
                    <p className="text-xs text-cyan-400 mb-1">{sage.role}</p>
                    <p className="text-sm text-slate-400 mb-2 line-clamp-2">{sage.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {sage.capabilities.slice(0, 3).map((cap, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                          {cap}
                        </span>
                      ))}
                      {sage.capabilities.length > 3 && (
                        <span className="text-xs px-2 py-0.5 text-slate-400">+{sage.capabilities.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-8">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-slate-800/50 border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
              size="sm"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1
                const isNearCurrent = Math.abs(pageNum - currentPage) <= 2
                const isFirstOrLast = pageNum === 1 || pageNum === totalPages

                if (!isNearCurrent && !isFirstOrLast) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="text-slate-500 px-1">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 shadow-lg shadow-purple-500/50 min-w-[40px]"
                        : "bg-slate-800/50 border-2 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500 backdrop-blur-sm min-w-[40px]"
                    }
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-slate-800/50 border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
              size="sm"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>

            <span className="text-slate-400 text-sm ml-4">
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, displaySages.length)} of{" "}
              {displaySages.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
