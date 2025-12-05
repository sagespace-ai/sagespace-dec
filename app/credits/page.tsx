"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, TrendingUp, ShoppingCart } from "lucide-react"
import { CreditPurchaseModal } from "@/components/credit-purchase-modal"

export default function CreditsPage() {
  const { user, updateCredits } = useAuth()
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  const recentTransactions = [
    { action: "Council Deliberation", amount: -50, time: "2 hours ago", agentId: "sage-1" },
    { action: "Artifact Creation", amount: -20, time: "5 hours ago", threadId: "thread-123" },
    { action: "Purchased Pack", amount: +500, time: "1 day ago" },
    { action: "Chat Message", amount: -5, time: "2 days ago", agentId: "sage-2" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
              Credits & Usage
            </h1>
            <p className="text-slate-400">Manage your credit balance and view transaction history.</p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Current Balance</CardTitle>
                <CardDescription>Available credits for AI interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-6xl font-bold text-white mb-2">{user?.credits}</div>
                    <div className="text-green-400">Credits remaining</div>
                  </div>
                  <Button
                    onClick={() => setShowPurchaseModal(true)}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Credits
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CreditCard className="w-8 h-8 text-green-400 mb-2" />
                  <CardTitle className="text-white text-lg">Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">500</div>
                  <p className="text-slate-400 text-sm">From referrals & rewards</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
                  <CardTitle className="text-white text-lg">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">875</div>
                  <p className="text-slate-400 text-sm">Across all actions</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Burn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">~75/day</div>
                  <p className="text-slate-400 text-sm">Average usage</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
                <CardDescription>Your recent credit activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                      <div>
                        <div className="font-medium text-white">{tx.action}</div>
                        <div className="text-sm text-slate-400">{tx.time}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={tx.amount > 0 ? "border-green-500 text-green-400" : "border-red-500 text-red-400"}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <CreditPurchaseModal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} />
    </div>
  )
}
