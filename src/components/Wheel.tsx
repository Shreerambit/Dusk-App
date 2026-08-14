import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import type { Category, CategoryId } from '@/lib/types'
import { useReducedMotion } from '@/hooks/useMotionPrefs'
import { useApp } from '@/store/app'
import { sfx } from '@/lib/sound'

interface WheelProps {
  categories: Category[]
  onResult: (id: CategoryId) => void
  /** Pre-decided winner (chosen by the smart randomiser) — the wheel animates to it. */
  pickWinner: () => CategoryId
  size?: number
}

const SPIN_MS = 4600

/** cubic-bezier-esque easing with a long tail so the wheel "settles". */
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

export function Wheel({ categories, onResult, pickWinner, size = 340 }: WheelProps) {
  const reduced = useReducedMotion()
  const soundOn = useApp((s) => s.preferences.sound)
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [burst, setBurst] = useState(0)

  const spinRef = useRef({ start: 0, from: 0, to: 0, lastTick: 0, active: false })
  const winnerRef = useRef<CategoryId | null>(null)

  const slice = 360 / categories.length
  const R = size / 2

  const paths = useMemo(() => {
    return categories.map((c, i) => {
      const a0 = (i * slice - 90) * (Math.PI / 180)
      const a1 = ((i + 1) * slice - 90) * (Math.PI / 180)
      const x0 = R + R * Math.cos(a0)
      const y0 = R + R * Math.sin(a0)
      const x1 = R + R * Math.cos(a1)
      const y1 = R + R * Math.sin(a1)
      const large = slice > 180 ? 1 : 0
      const mid = (i + 0.5) * slice - 90
      const labelR = R * 0.66
      // Keep text upright: flip 180° on the lower half so nothing reads upside-down.
      const normalized = ((mid % 360) + 360) % 360
      const flip = normalized > 90 && normalized < 270
      return {
        c,
        d: `M ${R} ${R} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`,
        labelX: R + labelR * Math.cos((mid * Math.PI) / 180),
        labelY: R + labelR * Math.sin((mid * Math.PI) / 180),
        rotate: flip ? mid + 180 : mid,
      }
    })
  }, [categories, slice, R])

  const spin = useCallback(() => {
    if (spinRef.current.active) return
    const winner = pickWinner()
    winnerRef.current = winner
    const idx = categories.findIndex((c) => c.id === winner)
    if (idx < 0) return

    // Pointer sits at top (12 o'clock). Land mid-slice with a little jitter.
    const jitter = (Math.random() - 0.5) * slice * 0.55
    const target = 360 - (idx * slice + slice / 2) + jitter
    const current = ((angle % 360) + 360) % 360
    const turns = 5 + Math.floor(Math.random() * 3)
    const delta = turns * 360 + ((target - current + 360) % 360)

    if (reduced) {
      setAngle(angle + ((target - current + 360) % 360))
      setBurst((b) => b + 1)
      if (soundOn) sfx.success()
      onResult(winner)
      return
    }

    spinRef.current = { start: performance.now(), from: angle, to: angle + delta, lastTick: 0, active: true }
    setSpinning(true)
  }, [angle, categories, onResult, pickWinner, reduced, slice, soundOn])

  useAnimationFrame((t) => {
    const s = spinRef.current
    if (!s.active) return
    const elapsed = t - s.start
    const p = Math.min(1, elapsed / SPIN_MS)
    const eased = easeOutQuint(p)
    const next = s.from + (s.to - s.from) * eased
    setAngle(next)

    // tick per slice boundary crossed, tapering with velocity
    const crossed = Math.floor(next / slice)
    if (crossed !== s.lastTick) {
      s.lastTick = crossed
      if (soundOn && p < 0.99) sfx.tick(Math.max(0.25, 1 - p))
    }

    if (p >= 1) {
      s.active = false
      setSpinning(false)
      setAngle(s.to)
      setBurst((b) => b + 1)
      if (soundOn) sfx.success()
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([12, 60, 22]) } catch { /* noop */ }
      }
      if (winnerRef.current) onResult(winnerRef.current)
    }
  })

  useEffect(() => () => { spinRef.current.active = false }, [])

  return (
    <div className="relative mx-auto select-none" style={{ width: size, height: size }}>
      {/* glow */}
      <motion.div
        aria-hidden
        className="absolute inset-[-14%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(224,67,106,.35), rgba(124,83,232,.22) 55%, transparent 72%)' }}
        animate={reduced ? {} : { opacity: spinning ? [0.65, 1, 0.65] : 0.6, scale: spinning ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 1.6, repeat: spinning ? Infinity : 0, ease: 'easeInOut' }}
      />

      {/* particles on result */}
      <Particles trigger={burst} size={size} disabled={reduced} />

      {/* pointer */}
      <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
        <motion.div
          animate={spinning && !reduced ? { y: [0, 2.5, 0] } : { y: 0 }}
          transition={{ duration: 0.12, repeat: spinning ? Infinity : 0 }}
          className="flex flex-col items-center"
        >
          <div
            className="h-6 w-6 rotate-45 rounded-[7px] border border-white/25 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#fff,#ffd9e3)' }}
          />
        </motion.div>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="relative z-10 drop-shadow-2xl"
        style={{ transform: `rotate(${angle}deg)`, willChange: 'transform' }}
        role="img"
        aria-label={`Wheel with ${categories.length} categories`}
      >
        <defs>
          {paths.map(({ c }, i) => (
            <linearGradient key={c.id} id={`wg-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.from} />
              <stop offset="100%" stopColor={c.to} />
            </linearGradient>
          ))}
          <radialGradient id="wheel-sheen" cx="50%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.34" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
          </radialGradient>
        </defs>

        {paths.map(({ c, d, labelX, labelY, rotate }, i) => (
          <g key={c.id}>
            <path d={d} fill={`url(#wg-${i})`} stroke="rgba(255,255,255,.14)" strokeWidth="1.5" />
            {/* Emoji only: a spun wheel rests at an arbitrary angle, so text
                labels would end up upside-down. The landed category is named
                on the result card and announced to screen readers. */}
            <g transform={`translate(${labelX} ${labelY}) rotate(${rotate})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.max(22, size * 0.085)}
                style={{ userSelect: 'none' }}
              >
                {c.emoji}
              </text>
            </g>
          </g>
        ))}

        <circle cx={R} cy={R} r={R - 1} fill="url(#wheel-sheen)" pointerEvents="none" />
        <circle cx={R} cy={R} r={R - 1} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" />
      </svg>

      {/* hub / spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        aria-label={spinning ? 'Wheel is spinning' : 'Spin the wheel'}
        className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-300 ease-spring active:scale-95 disabled:cursor-wait"
        style={{ width: size * 0.29, height: size * 0.29 }}
      >
        <span className="absolute inset-0 rounded-full glass-strong shadow-2xl" />
        <motion.span
          aria-hidden
          className="absolute inset-[6%] rounded-full"
          style={{ background: 'linear-gradient(135deg,#ff6b8b,#e0436a 45%,#a84ae0)' }}
          animate={reduced ? {} : spinning ? { scale: [1, 0.94, 1] } : { scale: [1, 1.035, 1] }}
          transition={{ duration: spinning ? 0.8 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="relative z-10 text-[12px] font-bold uppercase tracking-[0.14em] text-white">
          {spinning ? '…' : 'Spin'}
        </span>
      </button>
    </div>
  )
}

/* --------------------------------------------------------------- particles */

function Particles({ trigger, size, disabled }: { trigger: number; size: number; disabled: boolean }) {
  const [items, setItems] = useState<Array<{ id: number; x: number; y: number; c: string; d: number }>>([])

  useEffect(() => {
    if (!trigger || disabled) return
    const colors = ['#ff6b8b', '#e0436a', '#b79cff', '#7c53e8', '#ffd6a5', '#fff']
    const next = Array.from({ length: 26 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 26 + Math.random() * 0.4
      const dist = size * (0.42 + Math.random() * 0.34)
      return {
        id: trigger * 1000 + i,
        x: Math.cos(a) * dist,
        y: Math.sin(a) * dist,
        c: colors[i % colors.length],
        d: Math.random() * 0.12,
      }
    })
    setItems(next)
    const t = setTimeout(() => setItems([]), 1500)
    return () => clearTimeout(t)
  }, [trigger, size, disabled])

  if (disabled) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ width: 7, height: 7, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: 1.15, delay: p.d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  )
}
