"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { XIcon } from "@/components/icons"
import type { QuestCreationResult } from "@/lib/playground/multimodal"

interface QuestCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (quest: QuestCreationResult) => void
}

export function QuestCreatorModal({ isOpen, onClose, onCreate }: QuestCreatorModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState("")
  const [rewardXp, setRewardXp] = useState(100)
  const [duration, setDuration] = useState(7)

  if (!isOpen) return null

  const handleCreate = () => {
    if (title.trim() && description.trim() && goal.trim()) {
      onCreate({
        title: title.trim(),
        description: description.trim(),
        goal: goal.trim(),
        rewardXp,
        duration,
      })
      // Reset form
      setTitle("")
      setDescription("")
      setGoal("")
      setRewardXp(100)
      setDuration(7)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-slate-900 border-2 border-yellow-500/30 rounded-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Quest</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Quest Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Build a Daily Exercise Habit"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the quest involves..."
              className="w-full h-24 bg-slate-800 border border-slate-600 text-white rounded-lg p-3 resize-none focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Goal</label>
            <Input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Exercise for 30 minutes daily"
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Reward XP</label>
              <Input
                type="number"
                value={rewardXp}
                onChange={(e) => setRewardXp(parseInt(e.target.value) || 100)}
                min={10}
                max={1000}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Duration (days)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 7)}
                min={1}
                max={30}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} variant="ghost" className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !description.trim() || !goal.trim()}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
          >
            Create Quest
          </Button>
        </div>
      </Card>
    </div>
  )
}

