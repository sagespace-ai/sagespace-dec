"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const { upgradePlan } = useAuth()
  const router = useRouter()

  const handleUpgrade = (plan: "pro" | "enterprise") => {
    upgradePlan(plan)
    onClose()
    router.push("/pricing")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            {feature
              ? `${feature} is available on Pro and Enterprise plans.`
              : "Unlock more features and higher limits."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="p-6 rounded-lg bg-slate-800/50 border border-cyan-500/20">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="text-3xl font-bold text-cyan-400 mb-1">$15/mo</div>
              <p className="text-slate-400 text-sm">Perfect for power users</p>
            </div>
            <ul className="space-y-2 mb-6">
              {["5,000 credits/month", "Export conversations", "Publish agents", "Priority support"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <Check className="w-4 h-4 text-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Button onClick={() => handleUpgrade("pro")} className="w-full bg-cyan-500 hover:bg-cyan-600">
              Upgrade to Pro
            </Button>
          </div>
          <div className="p-6 rounded-lg bg-slate-800/50 border border-amber-500/20">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-amber-400 mb-1">Contact</div>
              <p className="text-slate-400 text-sm">For teams and organizations</p>
            </div>
            <ul className="space-y-2 mb-6">
              {["Unlimited credits", "Governance & compliance", "Verified marketplace", "SSO & team management"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-amber-400" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <Button onClick={() => handleUpgrade("enterprise")} className="w-full bg-amber-500 hover:bg-amber-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
