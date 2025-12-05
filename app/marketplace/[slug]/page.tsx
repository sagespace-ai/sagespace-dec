"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeftIcon, SparklesIcon, CheckIcon } from "@/components/icons"
import { SAGE_TEMPLATES } from "@/lib/sage-templates"
import { useParams } from "next/navigation"

export default function MarketplaceSagePage() {
  const params = useParams()
  const slug = params.slug as string

  // Find sage by converting name to slug format
  const sage = SAGE_TEMPLATES.find((s) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug)

  if (!sage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Sage Not Found</h1>
          <p className="text-slate-400 mb-8">This sage doesn't exist in our universe yet.</p>
          <Link href="/marketplace">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-black relative overflow-hidden">
      {/* Animated background */}
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

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplace">
            <Button variant="ghost" className="text-slate-300 hover:text-white mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm p-8">
              <div className="flex items-start gap-6">
                <div className="text-7xl">{sage.avatar}</div>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">{sage.name}</h1>
                  <p className="text-xl text-cyan-400 mb-4">{sage.role}</p>
                  <p className="text-slate-300 leading-relaxed">{sage.description}</p>
                </div>
              </div>
            </Card>

            {/* Capabilities */}
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Core Capabilities</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {sage.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{cap}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sample Conversation */}
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Sample Conversation</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm">
                    You
                  </div>
                  <div className="flex-1 bg-slate-800/50 rounded-2xl rounded-tl-none p-4">
                    <p className="text-slate-300">Tell me about your expertise</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-4xl">{sage.avatar}</div>
                  <div className="flex-1 bg-purple-900/30 rounded-2xl rounded-tl-none p-4 border border-purple-500/30">
                    <p className="text-slate-200">
                      Hello! I'm {sage.name}, specializing in {sage.domain.toLowerCase()}. I excel at{" "}
                      {sage.capabilities.slice(0, 3).join(", ").toLowerCase()}, and more. How can I assist you today?
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 border-purple-500/30 backdrop-blur-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{sage.avatar}</div>
                <h3 className="text-xl font-bold text-white mb-2">Start Chatting with {sage.name}</h3>
                <p className="text-slate-300 text-sm">Begin your conversation in the Playground</p>
              </div>

              <Link href={`/playground?sage=${sage.id}`} className="block">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 shadow-lg shadow-purple-500/50 text-lg py-6 mb-3">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Chat Now
                </Button>
              </Link>

              <Link href={`/council?sages=${sage.id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 bg-transparent"
                >
                  Add to Sage Circle
                </Button>
              </Link>
            </Card>

            {/* Stats Card */}
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-white mb-4">Sage Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Domain</span>
                  <span className="text-cyan-400 font-medium">{sage.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Capabilities</span>
                  <span className="text-purple-400 font-medium">{sage.capabilities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Popularity</span>
                  <span className="text-yellow-400 font-medium">⭐ 4.8/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chats Today</span>
                  <span className="text-green-400 font-medium">{Math.floor(Math.random() * 500) + 100}</span>
                </div>
              </div>
            </Card>

            {/* Related Sages */}
            <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold text-white mb-4">Similar Sages</h3>
              <div className="space-y-3">
                {SAGE_TEMPLATES.filter((s) => s.domain === sage.domain && s.id !== sage.id)
                  .slice(0, 3)
                  .map((related) => (
                    <Link
                      key={related.id}
                      href={`/marketplace/${related.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="text-3xl">{related.avatar}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
                          {related.name}
                        </div>
                        <div className="text-xs text-slate-400">{related.role}</div>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
