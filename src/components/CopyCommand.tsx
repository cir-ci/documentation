import { useState } from 'react'

/**
 * A command with a Copy button (use `client:visible`). The prompt character is not selectable, so
 * a triple-click copies only the command. For several lines, use a fenced `sh` block instead.
 */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="copy-command">
      <code>
        <span className="prompt" aria-hidden="true">
          ${' '}
        </span>
        {command}
      </code>
      <button
        type="button"
        aria-label={`Copy command: ${command}`}
        onClick={() => {
          void navigator.clipboard?.writeText(command).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className="sr-only" role="status">
        {copied ? 'Copied to the clipboard' : ''}
      </span>
    </div>
  )
}
