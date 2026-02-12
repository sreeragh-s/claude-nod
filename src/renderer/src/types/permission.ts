export interface PermissionData {
  tool_name: string
  tool_input: Record<string, unknown>
  queueCount: number
}

export interface ToolDetail {
  label: string
  value: string
}

export type DiffEntry = {
  type: 'context' | 'removed' | 'added'
  text: string
}
