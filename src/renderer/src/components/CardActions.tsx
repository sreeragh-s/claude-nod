interface CardActionsProps {
  onAllow: () => void
  onDeny: () => void
  onRejectWithFeedback: () => void
}

export function CardActions({
  onAllow,
  onDeny,
  onRejectWithFeedback
}: CardActionsProps): React.JSX.Element {
  return (
    <>
      <div className="card-actions">
        <button className="btn btn-deny" onClick={onDeny}>
          Deny
          <span className="kbd">Cmd+Esc</span>
        </button>
        <button className="btn btn-allow" onClick={onAllow}>
          Allow
          <span className="kbd">Cmd+Enter</span>
        </button>
      </div>
      <div className="card-footer">
        <button className="btn-feedback-link" onClick={onRejectWithFeedback}>
          Reject with feedback
        </button>
      </div>
    </>
  )
}
