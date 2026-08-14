import { motion } from 'framer-motion'
import { HeartHandshake, ShieldCheck } from 'lucide-react'
import type { Comfort } from '@/lib/types'
import { SegmentedControl } from '@/components/ui'
import { useApp } from '@/store/app'
import { ease } from '@/hooks/useMotionPrefs'

export const COMFORT_OPTIONS: Array<{ value: Comfort; label: string; hint: string }> = [
  { value: 'relaxed', label: 'Relaxed', hint: 'Gentle & easy' },
  { value: 'playful', label: 'Playful', hint: 'Light & fun' },
  { value: 'romantic', label: 'Romantic', hint: 'Warm & close' },
  { value: 'adventurous', label: 'Adventurous', hint: 'Bolder ideas' },
]

export function ComfortPicker({ compact }: { compact?: boolean }) {
  const comfort = useApp((s) => s.preferences.comfort)
  const setComfort = useApp((s) => s.setComfort)

  return (
    <SegmentedControl
      label={compact ? undefined : 'Comfort level'}
      options={COMFORT_OPTIONS.map((o) => ({ value: o.value, label: o.label, hint: compact ? undefined : o.hint }))}
      value={comfort}
      onChange={setComfort}
      columns={compact ? 4 : 2}
    />
  )
}

/** Shown once per session before challenges begin. */
export function ConsentCard({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="rounded-[28px] glass p-6 sm:p-8"
    >
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
          <HeartHandshake size={19} />
        </span>
        <div>
          <h3 className="display text-[19px]">Both partners should feel comfortable participating.</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Anything here can be skipped without explanation and without penalty. Either of you can
            change the category or end the session at any time. Choose the comfort level you both agree on.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ComfortPicker />
      </div>

      <button
        onClick={onContinue}
        className="btn btn-primary mt-6 h-13 w-full py-3.5 text-[15.5px]"
      >
        We both agree — continue
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-muted">
        <ShieldCheck size={13} />
        Private to this device
      </div>
    </motion.div>
  )
}

/** Persistent session controls attached to any active challenge. */
export function SessionControls({
  onSkip, onNotTonight, onChangeCategory, onStop, className = '',
}: {
  onSkip: () => void
  onNotTonight: () => void
  onChangeCategory?: () => void
  onStop: () => void
  className?: string
}) {
  const items = [
    { label: 'Skip', fn: onSkip },
    { label: 'Not tonight', fn: onNotTonight },
    ...(onChangeCategory ? [{ label: 'Change category', fn: onChangeCategory }] : []),
    { label: 'Stop session', fn: onStop },
  ]
  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {items.map((i) => (
        <button
          key={i.label}
          onClick={i.fn}
          className="chip hover:bg-white/10 active:scale-95 transition-all duration-200"
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}
