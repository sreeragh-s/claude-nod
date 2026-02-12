import { getToolLabel } from './services/toolService'
import { usePermissionHandler } from './hooks/usePermissionHandler'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { CardHeader } from './components/CardHeader'
import { CardBody } from './components/CardBody'
import { CardActions } from './components/CardActions'
import { FeedbackForm } from './components/FeedbackForm'

function App(): React.JSX.Element {
  const {
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
  } = usePermissionHandler()

  useKeyboardShortcuts({
    enabled: !!permission,
    feedbackMode,
    onAllow: handleAllow,
    onDeny: handleDeny,
    onCancelFeedback: handleCancelFeedback,
    onSendFeedback: handleSendFeedback
  })

  if (!permission) {
    return <div className="idle" />
  }

  const label = getToolLabel(permission.tool_name)

  return (
    <div className={`card ${visible ? 'visible' : ''}`}>
      <CardHeader label={label} queueCount={permission.queueCount} />

      {feedbackMode ? (
        <FeedbackForm
          feedbackText={feedbackText}
          onFeedbackChange={setFeedbackText}
          onSend={handleSendFeedback}
          onCancel={handleCancelFeedback}
          textareaRef={textareaRef}
        />
      ) : (
        <>
          <CardBody permission={permission} />
          <CardActions
            onAllow={handleAllow}
            onDeny={handleDeny}
            onRejectWithFeedback={handleRejectWithFeedback}
          />
        </>
      )}
    </div>
  )
}

export default App
