import iconSvg from '../../../../resources/icon.svg'

interface CardHeaderProps {
  label: string
  queueCount: number
}

export function CardHeader({ label, queueCount }: CardHeaderProps): React.JSX.Element {
  return (
    <div className="card-header">
      <div className="tool-badge">
        <img src={iconSvg} alt="Tool icon" className="tool-icon" />
        <span className="tool-name">{label}</span>
      </div>
      {queueCount > 0 && <span className="queue-badge">+{queueCount} more</span>}
    </div>
  )
}
