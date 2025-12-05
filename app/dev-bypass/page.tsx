"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DevBypassPage() {
  const router = useRouter()

  const enableBypass = () => {
    localStorage.setItem("DEV_BYPASS", "true")
    router.push("/playground")
    router.refresh()
  }

  const disableBypass = () => {
    localStorage.removeItem("DEV_BYPASS")
    localStorage.removeItem("sagespace_user")
    router.push("/")
    router.refresh()
  }

  useEffect(() => {
    const isEnabled = localStorage.getItem("DEV_BYPASS") === "true"
    if (isEnabled) {
      console.log("[v0] Dev Bypass is ENABLED")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-slate-900/80 border-cyan-500/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-400">Development Bypass</CardTitle>
          <CardDescription className="text-slate-400">
            Skip authentication for faster development iteration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <h3 className="text-white font-semibold mb-2">What does this do?</h3>
            <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
              <li>Auto-login on every page load</li>
              <li>Bypass authentication forms</li>
              <li>Access all features immediately</li>
              <li>Perfect for rapid development</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={enableBypass} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
              Enable Dev Bypass
            </Button>
            <Button
              onClick={disableBypass}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 bg-transparent"
            >
              Disable Dev Bypass
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center pt-4">
            Dev bypass state is stored in localStorage. Clear your browser data to reset.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
