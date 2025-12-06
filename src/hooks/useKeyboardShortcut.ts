import { useEffect } from 'react'

export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = new Set<string>()

      if (event.ctrlKey || event.metaKey) pressedKeys.add('mod')
      if (event.shiftKey) pressedKeys.add('shift')
      if (event.altKey) pressedKeys.add('alt')

      const key = event.key.toLowerCase()
      if (key !== 'control' && key !== 'meta' && key !== 'shift' && key !== 'alt') {
        pressedKeys.add(key)
      }

      const requiredKeys = new Set(keys.map(k => k.toLowerCase()))
      const hasAllKeys = keys.every(k => pressedKeys.has(k.toLowerCase()))

      if (hasAllKeys && pressedKeys.size === requiredKeys.size) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keys, callback, enabled])
}
