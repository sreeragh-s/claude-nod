interface FeedbackFormProps {
  feedbackText: string
  onFeedbackChange: (text: string) => void
  onSend: () => void
  onCancel: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function FeedbackForm({
  feedbackText,
  onFeedbackChange,
  onSend,
  onCancel,
  textareaRef
}: FeedbackFormProps): React.JSX.Element {
  return (
    <>
      <div className="card-body">
        <div className="detail-label">Feedback</div>
        <textarea
          ref={textareaRef}
          className="feedback-textarea"
          placeholder="Describe a different approach..."
          value={feedbackText}
          onChange={(e) => onFeedbackChange(e.target.value)}
        />
      </div>
      <div className="card-actions">
        <button className="btn btn-deny" onClick={onCancel}>
          Cancel
          <span className="kbd">Esc</span>
        </button>
        <button className="btn btn-allow" onClick={onSend} disabled={!feedbackText.trim()}>
          Send
          <span className="kbd">Cmd+Enter</span>
        </button>
      </div>
    </>
  )
}
