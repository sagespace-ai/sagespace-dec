"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SageSummary } from "@/types/sage-selector"

interface BrowseMultiverseButtonProps {
  onSelect: (sage: SageSummary) => void
}

export function BrowseMultiverseButton({ onSelect }: BrowseMultiverseButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:border-purple-400/60 text-purple-300 hover:text-purple-200"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Browse the Sage Multiverse
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-cyan-500/30 text-slate-100 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Sage Multiverse
            </DialogTitle>
            <DialogDescription className="text-slate-400">Explore all available sages across domains</DialogDescription>
          </DialogHeader>
          <div className="text-slate-300 text-center py-8">
            Coming soon: Browse hundreds of sages across all domains and expertise levels
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
