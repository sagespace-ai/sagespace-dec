"use client"

import { useState } from "react"
import { Coins, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CREDIT_PACKS } from "@/lib/monetization"
import { useAuth } from "@/lib/auth-context"

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreditPurchaseModal({ isOpen, onClose }: CreditPurchaseModalProps) {
  const [selectedPack, setSelectedPack] = useState(1)
  const { user } = useAuth()

  if (!isOpen) return null

  const handlePurchase = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          packIndex: selectedPack,
        }),
      })

      if (response.ok) {
        // TODO: Show success toast
        onClose()
      }
    } catch (error) {
      console.error("[v0] Error purchasing credits:", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-8 relative animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Buy Credits</h2>
            <p className="text-muted-foreground">Power your AI conversations with credit packs</p>
          </div>

          <div className="grid gap-4">
            {CREDIT_PACKS.map((pack, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPack(idx)}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  selectedPack === idx ? "border-purple-500 bg-purple-500/5" : "border-border hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold">{pack.credits} Credits</span>
                      {pack.bonus > 0 && (
                        <span className="bg-green-500/20 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />+{pack.bonus} Bonus
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Total: {pack.credits + pack.bonus} credits</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">${pack.price}</div>
                    <div className="text-xs text-muted-foreground">
                      ${(pack.price / (pack.credits + pack.bonus)).toFixed(3)}/credit
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            size="lg"
          >
            Purchase {CREDIT_PACKS[selectedPack].credits + CREDIT_PACKS[selectedPack].bonus} Credits for $
            {CREDIT_PACKS[selectedPack].price}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Credits never expire.
          </p>
        </div>
      </Card>
    </div>
  )
}
