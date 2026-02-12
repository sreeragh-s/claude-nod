import { useEffect } from 'react'

interface KeyboardShortcutOptions {
  enabled: boolean
  feedbackMode: boolean
  onAllow: () => void
  onDeny: () => void
  onCancelFeedback: () => void
  onSendFeedback: () => void
}

export function useKeyboardShortcuts({
  enabled,
  feedbackMode,
  onAllow,
  onDeny,
  onCancelFeedback,
  onSendFeedback
}: KeyboardShortcutOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!enabled) return

      if (feedbackMode) {
        if (e.key === 'Escape') {
          e.preventDefault()
          onCancelFeedback()
        } else if (e.metaKey && e.key === 'Enter') {
          e.preventDefault()
          onSendFeedback()
        }
        return
      }

      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault()
        onAllow()
      } else if (e.metaKey && e.key === 'Escape') {
        e.preventDefault()
        onDeny()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return (): void => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, feedbackMode, onAllow, onDeny, onCancelFeedback, onSendFeedback])
}
