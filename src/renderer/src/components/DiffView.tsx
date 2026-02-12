import { useState } from 'react'
import { computeDiff } from '../services/diffService'

export function DiffView({ oldStr, newStr }: { oldStr: string; newStr: string }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const entries = computeDiff(oldStr, newStr)

  let oldNum = 0
  let newNum = 0

  return (
    <div className="diff-container">
      <div className={`diff-view ${expanded ? 'diff-view-expanded' : ''}`}>
        {entries.map((entry, i) => {
          if (entry.type === 'removed') oldNum++
          else if (entry.type === 'added') newNum++
          else {
            oldNum++
            newNum++
          }

          const leftNum = entry.type === 'added' ? '' : oldNum
          const rightNum = entry.type === 'removed' ? '' : newNum

          return (
            <div key={i} className={`diff-line ${entry.type !== 'context' ? `diff-${entry.type}` : ''}`}>
              <span className="diff-gutter">{leftNum}</span>
              <span className="diff-gutter">{rightNum}</span>
              <span className="diff-prefix">
                {entry.type === 'removed' ? '-' : entry.type === 'added' ? '+' : ' '}
              </span>
              <span className="diff-text">{entry.text || ' '}</span>
            </div>
          )
        })}
        {entries.length > 5 && (
          <button className="diff-expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    </div>
  )
}
