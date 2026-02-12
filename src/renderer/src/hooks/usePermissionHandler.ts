import { useState, useCallback, useEffect, useRef } from 'react'
import type { PermissionData } from '../types/permission'

interface PermissionHandler {
  permission: PermissionData | null
  visible: boolean
  feedbackMode: boolean
  feedbackText: string
  setFeedbackText: (text: string) => void
  handleAllow: () => void
  handleDeny: () => void
  handleRejectWithFeedback: () => void
  handleSendFeedback: () => void
  handleCancelFeedback: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function usePermissionHandler(): PermissionHandler {
  const [permission, setPermission] = useState<PermissionData | null>(null)
  const [visible, setVisible] = useState(false)
  const [feedbackMode, setFeedbackMode] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const allowRef = useRef<() => void>(() => {})
  const denyRef = useRef<() => void>(() => {})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const dismiss = useCallback((): void => {
    setVisible(false)
    setFeedbackMode(false)
    setFeedbackText('')
    setTimeout(() => setPermission(null), 200)
  }, [])

  const handleAllow = useCallback((): void => {
    if (!permission) return
    window.permissionAPI.sendResponse({ behavior: 'allow' })
    dismiss()
  }, [permission, dismiss])

  const handleDeny = useCallback((): void => {
    if (!permission) return
    window.permissionAPI.sendResponse({ behavior: 'deny', message: 'Denied via overlay' })
    dismiss()
  }, [permission, dismiss])

  const handleRejectWithFeedback = useCallback((): void => {
    setFeedbackMode(true)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [])

  const handleSendFeedback = useCallback((): void => {
    if (!permission || !feedbackText.trim()) return
    window.permissionAPI.sendResponse({
      behavior: 'deny',
      message: feedbackText.trim()
    })
    dismiss()
  }, [permission, feedbackText, dismiss])

  const handleCancelFeedback = useCallback((): void => {
    setFeedbackMode(false)
    setFeedbackText('')
  }, [])

  // Keep refs in sync with latest callbacks
  allowRef.current = handleAllow
  denyRef.current = handleDeny

  // Register IPC listeners once — use refs to always call latest handlers
  useEffect(() => {
    window.permissionAPI.onPermissionRequest((data) => {
      setPermission(data)
      setFeedbackMode(false)
      setFeedbackText('')
      requestAnimationFrame(() => setVisible(true))
    })
    window.permissionAPI.onGlobalShortcut((action) => {
      if (action === 'allow') allowRef.current()
      else if (action === 'deny') denyRef.current()
    })
  }, [])

  return {
    permission,
    visible,
    feedbackMode,
    feedbackText,
    setFeedbackText,
    handleAllow,
    handleDeny,
    handleRejectWithFeedback,
    handleSendFeedback,
    handleCancelFeedback,
    textareaRef
  }
}
