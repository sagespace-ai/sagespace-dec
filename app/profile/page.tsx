"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { UserIcon, CreditCard, KeyIcon, ShareIcon } from "@/components/icons"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isProUser, isEnterpriseUser } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
              Profile & Settings
            </h1>
            <p className="text-slate-400">Manage your account, billing, and integrations.</p>
          </div>

          <div className="grid gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{user?.name}</CardTitle>
                      <CardDescription>{user?.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={
                        isEnterpriseUser()
                          ? "border-amber-500 text-amber-400"
                          : isProUser()
                            ? "border-cyan-500 text-cyan-400"
                            : "border-slate-500 text-slate-400"
                      }
                    >
                      {user?.plan.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Credits Balance</Label>
                    <div className="text-2xl font-bold text-white">{user?.credits}</div>
                  </div>
                  <div>
                    <Label>XP Level</Label>
                    <div className="text-2xl font-bold text-white">{user?.xp}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>Manage your plan and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                  <div>
                    <div className="font-medium text-white">Current Plan: {user?.plan.toUpperCase()}</div>
                    <div className="text-sm text-slate-400">
                      {isEnterpriseUser()
                        ? "Contact sales for details"
                        : isProUser()
                          ? "$15/month"
                          : "Free tier - Upgrade for more features"}
                    </div>
                  </div>
                  <Link href="/pricing">
                    <Button variant="outline">Change Plan</Button>
                  </Link>
                </div>
                <Link href="/credits">
                  <Button variant="outline" className="w-full bg-transparent">
                    Purchase Credits
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShareIcon className="w-5 h-5" />
                  Integrations
                </CardTitle>
                <CardDescription>Connect external services and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Stripe", "Supabase", "Notion"].map((integration) => (
                  <div key={integration} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center">
                        <ShareIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="font-medium text-white">{integration}</div>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      Not Connected
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <KeyIcon className="w-5 h-5" />
                  API Keys
                </CardTitle>
                <CardDescription>Manage your API access tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full bg-transparent">
                  Generate API Key
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
