import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Activity, HistoryEntry } from '@/lib/types'
import { Button, Sheet } from '@/components/ui'
import { useApp } from '@/store/app'
import { useFeedback } from '@/hooks/useHaptics'
import { spring } from '@/hooks/useMotionPrefs'

type Rating = NonNullable<HistoryEntry['rating']>

const REACTIONS: Array<{ value: NonNullable<HistoryEntry['reaction']>; emoji: string; label: string; rating: Rating }> = [
  { value: 'loved', emoji: '❤️', label: 'Loved it', rating: 5 },
  { value: 'good', emoji: '🙂', label: 'Good', rating: 4 },
  { value: 'okay', emoji: '😐', label: 'Okay', rating: 3 },
  { value: 'different', emoji: '🔄', label: 'Try something different', rating: 2 },
]

export function RatingSheet({
  activity, open, onClose, onDone,
}: { activity: Activity | null; open: boolean; onClose: () => void; onDone?: () => void }) {
  const complete = useApp((s) => s.complete)
  const rateHistory = useApp((s) => s.rateHistory)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()

  const [reaction, setReaction] = useState<HistoryEntry['reaction']>()
  const [stars, setStars] = useState(0)
  const [note, setNote] = useState('')

  function submit() {
    if (!activity) return
    const id = complete(activity)
    rateHistory(id, {
      reaction,
      rating: (stars || REACTIONS.find((r) => r.value === reaction)?.rating || 4) as HistoryEntry['rating'],
      note: note.trim() || undefined,
    })
    feedback('confirm', [10, 40, 14])
    notify('Added to Our Journey')
    setReaction(undefined); setStars(0); setNote('')
    onClose()
    onDone?.()
  }

  return (
    <Sheet open={open} onClose={onClose} title="How was it?">
      <p className="-mt-2 mb-5 text-[14px] leading-relaxed text-muted">
        {activity?.title}. Your answer only shapes what gets suggested next — it is never shared.
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {REACTIONS.map((r) => {
          const active = reaction === r.value
          return (
            <button
              key={r.value}
              onClick={() => { feedback('tap'); setReaction(r.value); setStars(r.rating) }}
              aria-pressed={active}
              className={`relative rounded-2xl p-4 text-left transition-all duration-300 ease-spring ${active ? 'ring-2 ring-rose-400/70' : 'hover:bg-white/[0.06]'} glass`}
            >
              <div className="text-[22px]">{r.emoji}</div>
              <div className="mt-1.5 text-[13.5px] font-medium leading-tight">{r.label}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="mb-2.5 text-[13px] font-medium text-muted">Rating</div>
        <div className="flex gap-2" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button
              key={n}
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} of 5`}
              whileTap={{ scale: 0.88 }}
              transition={spring.snappy}
              onClick={() => { feedback('tap'); setStars(n) }}
              className={`h-11 flex-1 rounded-2xl text-[15px] font-semibold transition-all duration-300 ${
                n <= stars ? 'bg-gradient-to-br from-rose-500 to-purple-500 text-white' : 'glass text-muted'
              }`}
            >
              {n}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="rating-note" className="mb-2.5 block text-[13px] font-medium text-muted">
          Private note (optional)
        </label>
        <textarea
          id="rating-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Something you want to remember about tonight…"
          className="w-full resize-none rounded-2xl glass p-4 text-[14.5px] placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
        />
      </div>

      <div className="mt-6 flex gap-2.5">
        <Button size="lg" className="flex-1" onClick={onClose}>Not now</Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={submit} disabled={!reaction && !stars}>
          Save
        </Button>
      </div>
    </Sheet>
  )
}
