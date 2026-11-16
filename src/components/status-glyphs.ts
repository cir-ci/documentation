// Glyph geometry copied from repo/packages/ui/src/StatusIcon.tsx (14x14 viewBox), so a state looks
// the same here and in the dashboard. The shape differs per state: color is never the only cue.
export type StatusName =
  | 'approved'
  | 'auto-approved'
  | 'needs-review'
  | 'processing'
  | 'failed'
  | 'rejected'
  | 'unchanged'
  | 'added'
  | 'removed'
  | 'flaky'
  | 'expired'
  | 'no-baseline'
  | 'uploading'

export const STATUS_LABEL: Record<StatusName, string> = {
  approved: 'Approved',
  'auto-approved': 'Auto-approved',
  'needs-review': 'Needs review',
  processing: 'Processing',
  failed: 'Failed',
  rejected: 'Rejected',
  unchanged: 'Unchanged',
  added: 'Added',
  removed: 'Removed',
  flaky: 'Flaky',
  expired: 'Expired',
  'no-baseline': 'No baseline',
  uploading: 'Uploading',
}

/** Eight short arcs round the circle: the dashed processing ring. */
export const PROCESSING_ARCS: string[] = Array.from({ length: 8 }, (_, i) => {
  const r = 5.75
  const step = (2 * Math.PI) / 8
  const sweep = step * 0.53
  const start = -Math.PI / 2 + i * step + (step - sweep) / 2
  const p = (a: number) => `${(7 + r * Math.cos(a)).toFixed(3)} ${(7 + r * Math.sin(a)).toFixed(3)}`
  return `M${p(start)}A${r} ${r} 0 0 1 ${p(start + sweep)}`
})
