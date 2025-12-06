"use client"

import { useEffect, useState } from "react"
import { XIcon } from "@/components/icons"

export interface PlaygroundToast {
  id: string
  message: string
  type: "success" | "error" | "info"
  duration?: number
}

interface PlaygroundToastProps {
  toast: PlaygroundToast
  onDismiss: (id: string) => void
}

function ToastComponent({ toast, onDismiss }: PlaygroundToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const duration = toast.duration || 5000
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onDismiss(toast.id), 300) // Wait for fade out
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const colors = {
    success: "bg-green-500/20 border-green-500/50 text-green-300",
    error: "bg-red-500/20 border-red-500/50 text-red-300",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  }

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  }

  return (
    <div
      className={`${colors[toast.type]} border-2 rounded-lg p-4 mb-3 flex items-center justify-between gap-3 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icons[toast.type]}</span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

interface PlaygroundToastContainerProps {
  toasts: PlaygroundToast[]
  onDismiss: (id: string) => void
}

export function PlaygroundToastContainer({ toasts, onDismiss }: PlaygroundToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export function usePlaygroundToast() {
  const [toasts, setToasts] = useState<PlaygroundToast[]>([])

  const showToast = (message: string, type: PlaygroundToast["type"] = "info", duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const toast: PlaygroundToast = { id, message, type, duration }
    setToasts((prev) => [...prev, toast])
    return id
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return {
    toasts,
    showToast,
    dismissToast,
    showSuccess: (message: string, duration?: number) => showToast(message, "success", duration),
    showError: (message: string, duration?: number) => showToast(message, "error", duration),
    showInfo: (message: string, duration?: number) => showToast(message, "info", duration),
  }
}

