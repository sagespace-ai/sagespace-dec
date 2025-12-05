"use client"

import { useState } from "react"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SUBSCRIPTION_TIERS } from "@/lib/monetization"
import { useAuth } from "@/lib/auth-context"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const { user } = useAuth()

  const handleUpgrade = async (tier: string) => {
    if (!user) {
      window.location.href = "/auth/login"
      return
    }

    // TODO: Implement Stripe payment flow
    console.log("[v0] Upgrading to", tier)
  }

  const tiers: Array<{
    key: string
    icon: typeof Sparkles
    color: string
    popular?: boolean
    name: string
    price: number
    credits: number
    features: readonly string[]
  }> = [
    {
      key: "free",
      icon: Sparkles,
      color: "from-blue-500 to-cyan-500",
      ...SUBSCRIPTION_TIERS.free,
    },
    {
      key: "pro",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      popular: true,
      ...SUBSCRIPTION_TIERS.pro,
    },
    {
      key: "enterprise",
      icon: Crown,
      color: "from-amber-500 to-orange-500",
      ...SUBSCRIPTION_TIERS.enterprise,
    },
  ]

  const discount = billingCycle === "yearly" ? 0.2 : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/20 to-purple-50/20 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of SageSpace with flexible pricing for creators, teams, and enterprises
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all duration-300 ${
                  billingCycle === "yearly" ? "right-1" : "left-1"
                }`}
              />
            </button>
            <span className={billingCycle === "yearly" ? "font-semibold" : "text-muted-foreground"}>
              Yearly
              <span className="ml-2 text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-sm font-semibold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const price = tier.key === "free" ? 0 : Math.floor(tier.price * (1 - discount))

            return (
              <Card
                key={tier.key}
                className={`relative p-8 ${
                  tier.popular ? "border-2 border-purple-500 shadow-2xl shadow-purple-500/20" : "border border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="space-y-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.color} p-2.5 text-white`}>
                    <Icon className="w-full h-full" />
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => handleUpgrade(tier.key)}
                    className={`w-full ${
                      tier.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : ""
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.key === "free" ? "Current Plan" : "Upgrade Now"}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, PayPal, and ACH transfers for Enterprise plans.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do credits roll over?</h3>
              <p className="text-sm text-muted-foreground">
                Unused monthly credits expire at the end of each billing cycle. Purchased credit packs never expire.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
