import type { PermissionData } from '../types/permission'
import { getToolDetail, isEditWithDiff } from '../services/toolService'
import { DiffView } from './DiffView'

interface CardBodyProps {
  permission: PermissionData
}

export function CardBody({ permission }: CardBodyProps): React.JSX.Element {
  const detail = getToolDetail(permission)
  const showDiff = isEditWithDiff(permission)

  return (
    <div className="card-body">
      <div className="detail-label">{detail.label}</div>
      <div className="detail-value">{detail.value}</div>
      {showDiff && (
        <>
          <div className="detail-label diff-label">Changes</div>
          <DiffView
            oldStr={String(permission.tool_input.old_string)}
            newStr={String(permission.tool_input.new_string)}
          />
        </>
      )}
    </div>
  )
}
