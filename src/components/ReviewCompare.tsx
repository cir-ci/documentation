import { useEffect, useRef, useState } from 'react'

/**
 * The landing page's centerpiece: one real changed screenshot from the dashboard (build #22,
 * "contact": 18.2% of pixels changed), as the build page shows it. Drag or use the arrow keys on
 * the slider to move between the baseline and this build, or switch to the diff. The slider
 * sweeps once on load (not with reduced motion) and stops at the first touch.
 */
export default function ReviewCompare(props: {
  before: string
  after: string
  diff: string
  width: number
  height: number
}) {
  const { before, after, diff, width, height } = props
  const [mode, setMode] = useState<'slider' | 'diff'>('slider')
  const [pos, setPos] = useState(50)
  const swept = useRef(false)
  const stop = useRef(false)

  useEffect(() => {
    if (swept.current) return
    swept.current = true
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setPos(100)
    let raf = 0
    const start = performance.now() + 500
    const tick = (now: number) => {
      if (stop.current) return
      const t = Math.min(1, Math.max(0, (now - start) / 1600))
      const eased = 1 - Math.pow(1 - t, 3)
      setPos(100 - eased * 62)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="review-compare">
      <div className="rc-head">
        <span className="rc-state">
          <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
            <circle cx="7" cy="7" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 .75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
          </svg>
          <span>Needs review</span>
        </span>
        <span className="rc-name">contact</span>
        <span className="rc-meta">18.2% of pixels changed</span>
        <div role="group" aria-label="View" className="rc-modes">
          <button type="button" aria-pressed={mode === 'slider'} onClick={() => setMode('slider')}>
            Slider
          </button>
          <button type="button" aria-pressed={mode === 'diff'} onClick={() => setMode('diff')}>
            Diff
          </button>
        </div>
      </div>
      <div className="rc-stage" style={{ aspectRatio: `${width} / ${height}` }}>
        <img src={after} alt={mode === 'slider' ? 'This build: three contact cards below the heading.' : ''} width={width} height={height} />
        {mode === 'slider' ? (
          <>
            <img
              className="rc-before"
              src={before}
              alt="Baseline: one contact card."
              width={width}
              height={height}
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            />
            <span className="rc-line" style={{ left: `${pos}%` }} aria-hidden="true">
              <span className="rc-grip" />
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(pos)}
              aria-label="Compare baseline and this build"
              aria-valuetext={`${Math.round(pos)}% baseline, baseline on the left, this build on the right`}
              onPointerDown={() => (stop.current = true)}
              onKeyDown={() => (stop.current = true)}
              onChange={(e) => {
                stop.current = true
                setPos(Number(e.target.value))
              }}
            />
          </>
        ) : (
          <img className="rc-diff" src={diff} alt="Changed pixels in red where two cards were added." width={width} height={height} />
        )}
      </div>
      {mode === 'diff' ? (
        <div className="rc-foot rc-legend">
          <span>
            <i className="rc-swatch rc-swatch--changed" aria-hidden="true" /> Changed pixels
          </span>
          <span>
            <i className="rc-swatch" aria-hidden="true" /> Unchanged
          </span>
        </div>
      ) : (
        <div className="rc-foot">
          <span>Baseline</span>
          <span>This build</span>
        </div>
      )}
    </div>
  )
}
