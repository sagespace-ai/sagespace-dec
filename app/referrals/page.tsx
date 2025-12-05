"use client"

import { useState, useEffect } from "react"
import { Copy, Users, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export default function ReferralsPage() {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [stats, setStats] = useState({ clicks: 0, signups: 0, earnings: 0 })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return

    // Fetch or generate referral code
    fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, action: "generate" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code) setReferralCode(data.code)
      })

    // Fetch referral stats
    fetch(`/api/referrals?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.referrals?.length > 0) {
          const referral = data.referrals[0]
          setStats({
            clicks: referral.clicks,
            signups: referral.signups,
            earnings: referral.earnings,
          })
        }
      })
  }, [user])

  const referralLink = `https://sagespace.co?ref=${referralCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-purple-50/10 to-pink-50/10 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Referral Program
            </h1>
            <p className="text-xl text-muted-foreground">Earn 50 credits for every friend who joins SageSpace</p>
          </div>

          {/* Referral Link Card */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Your Referral Link</h2>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} className="shrink-0">
                {copied ? "Copied!" : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Share this link with friends. When they sign up, you'll both earn bonus credits!
            </p>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.clicks}</div>
                  <div className="text-sm text-muted-foreground">Total Clicks</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.signups}</div>
                  <div className="text-sm text-muted-foreground">Signups</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{stats.earnings}</div>
                  <div className="text-sm text-muted-foreground">Credits Earned</div>
                </div>
              </div>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Share Your Link</h3>
                <p className="text-sm text-muted-foreground">
                  Copy your unique referral link and share it with friends
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Friends Sign Up</h3>
                <p className="text-sm text-muted-foreground">They create an account using your referral link</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">You both get 50 credits instantly</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
