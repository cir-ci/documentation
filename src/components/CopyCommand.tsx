import { useState } from 'react'

/**
 * A React island example (use `client:visible`). Later pages can embed real islands, e.g. components
 * from `@circi/ui`: see DESIGN.md, "Reusing @circi/ui".
 */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="copy-command">
      <code>{command}</code>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(command).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          })
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
