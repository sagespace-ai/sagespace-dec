"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XIcon } from "@/components/icons"

interface CodeEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (code: string, language: string) => void
}

export function CodeEditorModal({ isOpen, onClose, onSave }: CodeEditorModalProps) {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")

  if (!isOpen) return null

  const handleSave = () => {
    if (code.trim()) {
      onSave(code, language)
      setCode("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[80vh] bg-slate-900 border-2 border-cyan-500/30 rounded-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Code Editor</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-300 mb-2 block">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-3 py-2 w-full"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>

        <div className="flex-1 mb-4">
          <label className="text-sm text-slate-300 mb-2 block">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code here..."
            className="w-full h-64 bg-slate-800 border border-slate-600 text-white font-mono text-sm rounded-lg p-4 resize-none focus:border-cyan-500 focus:outline-none"
            spellCheck={false}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} variant="ghost" className="text-slate-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!code.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
          >
            Save and Attach
          </Button>
        </div>
      </Card>
    </div>
  )
}

