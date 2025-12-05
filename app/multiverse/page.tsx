"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  HomeIcon,
  SparklesIcon,
  HeartIcon,
  MessageCircleIcon,
  ShareIcon,
  BookmarkIcon,
  TrendingUpIcon,
  UserIcon,
  ZapIcon,
} from "@/components/icons"

interface ConversationPost {
  id: string
  sage: {
    name: string
    avatar: string
    role: string
  }
  human: {
    name: string
    avatar: string
  }
  topic: string
  excerpt: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  bookmarks: number
  tags: string[]
  likedByUser: boolean
  bookmarkedByUser: boolean
  trending: boolean
  engagement: {
    likedByHumans: string[]
    topComment?: string
  }
}

export default function MultiversePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [filter, setFilter] = useState<string>("all")
  const [conversations, setConversations] = useState<ConversationPost[]>([])
  const [expandedPost, setExpandedPost] = useState<string | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const mockConversations: ConversationPost[] = [
      {
        id: "1",
        sage: { name: "Dr. Wellness", avatar: "🏥", role: "Health & Wellness Expert" },
        human: { name: "Sarah M.", avatar: "👩‍💼" },
        topic: "Building a sustainable morning routine that actually works",
        excerpt:
          "I asked Dr. Wellness about creating a morning routine that doesn't feel overwhelming. The advice about starting with just ONE thing changed everything for me...",
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        likes: 847,
        comments: 132,
        shares: 64,
        bookmarks: 291,
        tags: ["wellness", "productivity", "habits"],
        likedByUser: false,
        bookmarkedByUser: false,
        trending: true,
        engagement: {
          likedByHumans: ["Alex K.", "Jamie R.", "Morgan T.", "+844 others"],
          topComment: "This exactly what I needed! Starting tomorrow 💪",
        },
      },
      {
        id: "2",
        sage: { name: "Creative Muse", avatar: "🎨", role: "Creativity & Innovation" },
        human: { name: "Alex T.", avatar: "🧑‍🎨" },
        topic: "Overcoming creative block when you're under pressure",
        excerpt:
          "Had the most insightful conversation about why creative blocks happen under pressure. Creative Muse explained the neuroscience behind it and gave me 3 techniques that work instantly...",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 1203,
        comments: 287,
        shares: 156,
        bookmarks: 542,
        tags: ["creativity", "productivity", "mindset"],
        likedByUser: true,
        bookmarkedByUser: true,
        trending: true,
        engagement: {
          likedByHumans: ["Lisa P.", "David W.", "Emma S.", "+1200 others"],
          topComment: "The constraint technique is GOLD. Used it today and wrote 2000 words! 🎯",
        },
      },
      {
        id: "3",
        sage: { name: "Strategy Sage", avatar: "💼", role: "Business Strategy" },
        human: { name: "Marcus J.", avatar: "👨‍💻" },
        topic: "How to make better decisions when you have too many options",
        excerpt:
          "Strategy Sage walked me through a decision-making framework that eliminated 80% of my options in 10 minutes. The clarity was immediate...",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        likes: 956,
        comments: 178,
        shares: 89,
        bookmarks: 423,
        tags: ["decision-making", "strategy", "productivity"],
        likedByUser: false,
        bookmarkedByUser: true,
        trending: false,
        engagement: {
          likedByHumans: ["Sophie L.", "Ryan M.", "Taylor B.", "+953 others"],
          topComment: "Using this for my career pivot. Thank you for sharing! 🙏",
        },
      },
      {
        id: "4",
        sage: { name: "Prof. Knowledge", avatar: "📚", role: "Learning & Education" },
        human: { name: "Nina P.", avatar: "👩‍🎓" },
        topic: "The science of learning: Why cramming doesn't work",
        excerpt:
          "Prof. Knowledge broke down the neuroscience of memory formation. Turns out everything I thought about studying was wrong. Mind = blown 🤯",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        likes: 1456,
        comments: 342,
        shares: 287,
        bookmarks: 678,
        tags: ["learning", "education", "science"],
        likedByUser: true,
        bookmarkedByUser: false,
        trending: true,
        engagement: {
          likedByHumans: ["Chris D.", "Jordan F.", "Riley K.", "+1453 others"],
          topComment: "Wish I knew this in college! Sharing with my kids now 📖",
        },
      },
      {
        id: "5",
        sage: { name: "Mindful Guide", avatar: "🧘", role: "Mental Wellness" },
        human: { name: "Jordan K.", avatar: "🧑‍🦱" },
        topic: "Managing anxiety without medication: A personal journey",
        excerpt:
          "Had a vulnerable conversation with Mindful Guide about managing my anxiety. The breathing techniques and reframing exercises have been life-changing...",
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        likes: 2134,
        comments: 456,
        shares: 198,
        bookmarks: 891,
        tags: ["mental-health", "wellness", "mindfulness"],
        likedByUser: false,
        bookmarkedByUser: true,
        trending: false,
        engagement: {
          likedByHumans: ["Casey M.", "Drew P.", "Avery L.", "+2131 others"],
          topComment: "Your courage in sharing this helps so many people. Thank you 💜",
        },
      },
      {
        id: "6",
        sage: { name: "Code Architect", avatar: "💻", role: "Software Development" },
        human: { name: "Dev S.", avatar: "👨‍💻" },
        topic: "Refactoring legacy code without breaking everything",
        excerpt:
          "Code Architect gave me a systematic approach to refactoring that I wish I learned years ago. The strangler fig pattern is genius...",
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        likes: 743,
        comments: 124,
        shares: 67,
        bookmarks: 312,
        tags: ["coding", "software", "technology"],
        likedByUser: true,
        bookmarkedByUser: false,
        trending: false,
        engagement: {
          likedByHumans: ["Pat H.", "Sam C.", "River J.", "+740 others"],
          topComment: "This saved my project. Our codebase is finally manageable! 🚀",
        },
      },
    ]

    setConversations(mockConversations)
  }, [])

  const handleLike = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              likes: conv.likedByUser ? conv.likes - 1 : conv.likes + 1,
              likedByUser: !conv.likedByUser,
            }
          : conv,
      ),
    )
  }

  const handleBookmark = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              bookmarks: conv.bookmarkedByUser ? conv.bookmarks - 1 : conv.bookmarks + 1,
              bookmarkedByUser: !conv.bookmarkedByUser,
            }
          : conv,
      ),
    )
  }

  const filteredConversations =
    filter === "all"
      ? conversations
      : filter === "trending"
        ? conversations.filter((c) => c.trending)
        : filter === "bookmarked"
          ? conversations.filter((c) => c.bookmarkedByUser)
          : conversations.filter((c) => c.tags.includes(filter))

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      <div
        className="fixed pointer-events-none opacity-30 blur-3xl z-0"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(6,182,212,0.2) 50%, transparent 100%)",
          transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/10 backdrop-blur-md bg-black/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/playground">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    Hub
                  </Button>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  The Feed
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/playground">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 text-center animate-fade-in">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x"
              style={{ backgroundSize: "300% 300%" }}
            >
              Discover Sage Wisdom
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6">
              See what others are learning. Get inspired. Join the conversation.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                }`}
              >
                🌟 For You
              </button>
              <button
                onClick={() => setFilter("trending")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === "trending"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                }`}
              >
                🔥 Trending
              </button>
              <button
                onClick={() => setFilter("bookmarked")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === "bookmarked"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                }`}
              >
                📚 Saved
              </button>
              <button
                onClick={() => setFilter("wellness")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === "wellness"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                }`}
              >
                💪 Wellness
              </button>
              <button
                onClick={() => setFilter("productivity")}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === "productivity"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/50 scale-105"
                    : "bg-slate-800/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/10"
                }`}
              >
                ⚡ Productivity
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredConversations.map((post, i) => (
              <Card
                key={post.id}
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-2 border-purple-500/20 rounded-2xl p-6 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] animate-fade-in relative overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Corner glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-3xl" />

                <div className="relative z-10">
                  {/* Post header with human and sage info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{post.human.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{post.human.name}</span>
                          <span className="text-slate-400">chatted with</span>
                          <div className="flex items-center gap-1">
                            <span className="text-2xl">{post.sage.avatar}</span>
                            <span className="font-semibold text-cyan-400">{post.sage.name}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {new Date(post.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                          {post.trending && (
                            <span className="ml-2 text-orange-400 flex items-center gap-1 inline-flex">
                              <TrendingUpIcon className="w-3 h-3" />
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conversation topic and excerpt */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{post.topic}</h3>
                    <p className="text-slate-300 leading-relaxed">
                      {expandedPost === post.id ? post.excerpt : `${post.excerpt.slice(0, 150)}...`}
                    </p>
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-cyan-400 text-sm mt-2 hover:text-cyan-300 transition-colors"
                    >
                      {expandedPost === post.id ? "Show less" : "Read more"}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Engagement stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.likedByUser ? "text-pink-400" : "text-slate-400 hover:text-pink-400"
                        }`}
                      >
                        <HeartIcon className={`w-5 h-5 ${post.likedByUser ? "fill-pink-400" : ""}`} />
                        <span className="text-sm font-medium">{post.likes.toLocaleString()}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                        <MessageCircleIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors">
                        <ShareIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.shares}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-colors ${
                        post.bookmarkedByUser ? "text-yellow-400" : "text-slate-400 hover:text-yellow-400"
                      }`}
                    >
                      <BookmarkIcon className={`w-5 h-5 ${post.bookmarkedByUser ? "fill-yellow-400" : ""}`} />
                    </button>
                  </div>

                  {/* Social proof - who else engaged */}
                  {post.engagement.likedByHumans.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <HeartIcon className="w-3 h-3 text-pink-400" />
                        Liked by <span className="text-slate-300">{post.engagement.likedByHumans.join(", ")}</span>
                      </div>
                    </div>
                  )}

                  {/* Top comment */}
                  {post.engagement.topComment && expandedPost === post.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="flex items-start gap-2">
                        <UserIcon className="w-4 h-4 text-slate-400 mt-1" />
                        <div>
                          <span className="text-xs font-semibold text-slate-300">Top comment:</span>
                          <p className="text-sm text-slate-400 mt-1">{post.engagement.topComment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border-2 border-purple-500/30 rounded-2xl backdrop-blur text-center animate-float">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready to Start Your Own Journey?</h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              Chat with any of our 300 specialized sages and share your discoveries with the community
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/playground">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  Start Chatting
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                >
                  Browse All Sages
                </Button>
              </Link>
            </div>
          </div>

          {/* Pro tips section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <ZapIcon className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-white">Community Tips</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex gap-2">
                <span>💡</span>
                <span className="text-slate-300">Bookmark conversations to revisit them later in Memory Lane</span>
              </div>
              <div className="flex gap-2">
                <span>🔥</span>
                <span className="text-slate-300">Trending conversations often reveal popular sage combinations</span>
              </div>
              <div className="flex gap-2">
                <span>💬</span>
                <span className="text-slate-300">Comment to share your own experiences and help others learn</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
