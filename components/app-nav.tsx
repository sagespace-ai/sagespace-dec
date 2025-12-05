"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserMenu } from "./user-menu"
import { CreditsBadge } from "./credits-badge"
import { Plus } from "lucide-react"

const navItems = [
  { href: "/multiverse", label: "Multiverse", icon: "🌊" },
  { href: "/council", label: "Council", icon: "🤝" },
  { href: "/memory", label: "Memory", icon: "📖" },
  { href: "/persona-editor", label: "Studio", icon: "⚡" },
  { href: "/marketplace", label: "Marketplace", icon: "🏪" },
  { href: "/observatory", label: "Observatory", icon: "👁️" },
]

export function AppNav() {
  const pathname = usePathname()

  console.log("[v0] AppNav rendering, pathname:", pathname)

  if (pathname?.startsWith("/auth")) {
    return null
  }

  const isMarketingPage = pathname === "/"

  if (isMarketingPage) {
    return null
  }

  return (
    <>
      {/* Desktop navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="font-bold text-xl text-primary hover:text-primary/80 transition-colors"
                onClick={() => console.log("[v0] Home clicked")}
              >
                SageSpace
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => console.log("[v0] Nav clicked:", item.href)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-all duration-200",
                        pathname === item.href
                          ? "text-primary bg-primary/10 shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/playground">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Conversation
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                >
                  Upgrade
                </Button>
              </Link>
              <CreditsBadge />
              <div className="h-6 w-px bg-border" />
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border lg:hidden safe-area-inset-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} onClick={() => console.log("[v0] Mobile nav clicked:", item.href)}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-2 w-full",
                  pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Button>
            </Link>
          ))}
          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-2 w-full",
                pathname === "/profile" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-xl">👤</span>
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </nav>
    </>
  )
}
