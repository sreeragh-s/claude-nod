export interface PermissionData {
  tool_name: string
  tool_input: Record<string, unknown>
  permission_suggestions?: string[]
  queueCount: number
}

export interface PermissionAPI {
  onPermissionRequest: (callback: (data: PermissionData) => void) => void
  sendResponse: (decision: { behavior: string; message?: string }) => void
  onGlobalShortcut: (callback: (action: 'allow' | 'deny') => void) => void
}

declare global {
  interface Window {
    permissionAPI: PermissionAPI
  }
}
