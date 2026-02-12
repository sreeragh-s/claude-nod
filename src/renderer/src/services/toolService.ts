import type { PermissionData, ToolDetail } from '../types/permission'

const TOOL_LABELS: Record<string, string> = {
  Bash: 'Terminal',
  Edit: 'Edit',
  Write: 'Write',
  Read: 'Read',
  Glob: 'Glob',
  Grep: 'Grep',
  Task: 'Task',
  WebFetch: 'Fetch',
  WebSearch: 'Search',
  NotebookEdit: 'Notebook'
}

export function getToolLabel(toolName: string): string {
  return TOOL_LABELS[toolName] || toolName
}

export function getToolDetail(data: PermissionData): ToolDetail {
  const input = data.tool_input
  switch (data.tool_name) {
    case 'Bash':
      return { label: 'Command', value: String(input.command || '') }
    case 'Edit':
      return { label: 'File', value: String(input.file_path || '') }
    case 'Write':
      return { label: 'File', value: String(input.file_path || '') }
    case 'Read':
      return { label: 'File', value: String(input.file_path || '') }
    case 'Glob':
      return { label: 'Pattern', value: String(input.pattern || '') }
    case 'Grep':
      return { label: 'Search', value: String(input.pattern || '') }
    case 'WebFetch':
      return { label: 'URL', value: String(input.url || '') }
    case 'WebSearch':
      return { label: 'Query', value: String(input.query || '') }
    default:
      return { label: 'Input', value: JSON.stringify(input, null, 2) }
  }
}

export function isEditWithDiff(data: PermissionData): boolean {
  return data.tool_name === 'Edit' && !!data.tool_input.old_string && !!data.tool_input.new_string
}
