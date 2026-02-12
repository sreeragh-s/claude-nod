import { contextBridge, ipcRenderer } from 'electron'

const permissionAPI = {
  onPermissionRequest: (
    callback: (data: {
      tool_name: string
      tool_input: Record<string, unknown>
      permission_suggestions?: string[]
      queueCount: number
    }) => void
  ): void => {
    ipcRenderer.on('permission-request', (_event, data) => callback(data))
  },
  sendResponse: (decision: { behavior: string; message?: string }): void => {
    ipcRenderer.send('permission-response', decision)
  },
  onGlobalShortcut: (callback: (action: 'allow' | 'deny') => void): void => {
    ipcRenderer.on('global-shortcut', (_event, action) => callback(action))
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('permissionAPI', permissionAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.permissionAPI = permissionAPI
}
