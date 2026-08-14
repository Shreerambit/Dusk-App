import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, RotateCcw, Wand2 } from 'lucide-react'
import type { Cost, DatePlan, LocationKind, Mood } from '@/lib/types'
import { Button, GlassCard, SegmentedControl } from '@/components/ui'
import { CategoryBadge, SaveButton } from '@/components/ActivityCard'
import { SessionControls } from '@/components/ConsentControls'
import { RatingSheet } from '@/components/RatingSheet'
import { useApp } from '@/store/app'
import { generateDatePlan } from '@/lib/engine'
import { formatDuration } from '@/lib/data/schema'
import { ease, spring, useReducedMotion } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'
import type { Activity } from '@/lib/types'

const BUDGETS: Array<{ value: Cost | 'any'; label: string }> = [
  { value: 'free', label: 'Free' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'premium', label: 'Premium' },
]

const LOCATIONS: Array<{ value: LocationKind | 'anywhere'; label: string }> = [
  { value: 'home', label: 'Home' },
  { value: 'outdoors', label: 'Outdoors' },
  { value: 'venue', label: 'Restaurant' },
  { value: 'anywhere', label: 'Anywhere' },
]

const TIMES = [
  { value: '15', label: '15 min' },
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '300', label: 'Full evening' },
  { value: '600', label: 'Weekend' },
]

const MOODS: Array<{ value: Mood | 'any'; label: string }> = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'funny', label: 'Funny' },
  { value: 'relaxing', label: 'Relaxing' },
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'spontaneous', label: 'Spontaneous' },
  { value: 'cozy', label: 'Cozy' },
]

export default function DateBuilder() {
  const comfort = useApp((s) => s.preferences.comfort)
  const signals = useApp((s) => s.signals)
  const toggleFavorite = useApp((s) => s.toggleFavorite)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()
  const reduced = useReducedMotion()

  const [budget, setBudget] = useState<Cost | 'any'>('low')
  const [location, setLocation] = useState<LocationKind | 'anywhere'>('anywhere')
  const [time, setTime] = useState('120')
  const [mood, setMood] = useState<Mood | 'any'>('romantic')
  const [plan, setPlan] = useState<DatePlan | null>(null)
  const [building, setBuilding] = useState(false)
  const [rating, setRating] = useState<Activity | null>(null)

  function build() {
    feedback('tap')
    setBuilding(true)
    const delay = reduced ? 0 : 620
    window.setTimeout(() => {
      const next = generateDatePlan(
        { budget, location, minutes: Number(time), mood },
        comfort,
        signals(),
      )
      setPlan(next)
      setBuilding(false)
      feedback('reveal', [8, 30, 10])
    }, delay)
  }

  return (
    <div className="pb-6">
      <header className="mb-8">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Build our date</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Four inputs and Dusk sequences a complete evening that fits the time you actually have.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-7">
        <GlassCard className="h-fit space-y-6 p-6 lg:sticky lg:top-24">
          <SegmentedControl label="Budget" options={BUDGETS} value={budget} onChange={setBudget} columns={2} />
          <SegmentedControl label="Location" options={LOCATIONS} value={location} onChange={setLocation} columns={2} />
          <SegmentedControl label="Time" options={TIMES} value={time} onChange={setTime} columns={3} />
          <SegmentedControl label="Mood" options={MOODS} value={mood} onChange={setMood} columns={3} />

          <Button variant="primary" size="lg" full icon={<Wand2 size={18} />} onClick={build} disabled={building}>
            {building ? 'Building…' : plan ? 'Build another' : 'Generate our date'}
          </Button>
        </GlassCard>

        <div>
          <AnimatePresence mode="wait">
            {building && (
              <motion.div
                key="building"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-[92px] rounded-[24px] glass"
                    animate={{ opacity: [0.4, 0.75, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </motion.div>
            )}

            {!building && plan && (
              <motion.div
                key={plan.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={spring.soft}
              >
                <GlassCard className="overflow-hidden p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">Your plan</div>
                      <h2 className="display mt-2 text-[28px] sm:text-[34px]">{plan.title}</h2>
                      <p className="mt-2 text-[13.5px] text-muted">
                        {plan.steps.length} steps · about {formatDuration(plan.totalMinutes)}
                      </p>
                    </div>
                    <Button
                      icon={<Bookmark size={15} />}
                      onClick={() => {
                        toggleFavorite({
                          kind: 'date',
                          title: plan.title,
                          subtitle: `${plan.steps.length} steps · ${formatDuration(plan.totalMinutes)}`,
                          payload: plan.steps.map((s) => ({ label: s.label, title: s.activity.title })),
                        })
                      }}
                    >
                      Save plan
                    </Button>
                  </div>

                  <ol className="mt-7 space-y-3">
                    {plan.steps.map((step, i) => (
                      <motion.li
                        key={step.activity.id}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.09, duration: 0.55, ease }}
                        className="relative rounded-[24px] bg-white/[0.05] p-4 sm:p-5"
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-[13px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#ff6b8b,#a84ae0)' }}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11.5px] uppercase tracking-wide text-muted">{step.label}</div>
                            <h3 className="mt-1 text-[17px] font-semibold leading-tight">{step.activity.title}</h3>
                            <p className="mt-2 text-[14px] leading-relaxed text-muted">{step.activity.description}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <CategoryBadge id={step.activity.category} />
                              <span className="chip">{formatDuration(step.activity.duration)}</span>
                              <button
                                onClick={() => setRating(step.activity)}
                                className="chip hover:bg-white/10 transition-colors"
                              >
                                Mark done
                              </button>
                            </div>
                          </div>
                          <SaveButton activity={step.activity} className="shrink-0" />
                        </div>
                      </motion.li>
                    ))}
                  </ol>

                  <div className="mt-7 flex flex-wrap gap-2.5">
                    <Button variant="primary" size="lg" icon={<RotateCcw size={16} />} onClick={build}>
                      Regenerate
                    </Button>
                    <Button size="lg" onClick={() => { setPlan(null); notify('Plan cleared') }}>Clear</Button>
                  </div>
                </GlassCard>

                <SessionControls
                  className="mt-5"
                  onSkip={build}
                  onNotTonight={() => { setPlan(null); notify('No problem — nothing saved') }}
                  onStop={() => { setPlan(null); notify('Session ended') }}
                />
              </motion.div>
            )}

            {!building && !plan && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] glass p-10 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-rose-300">
                  <Wand2 size={24} />
                </span>
                <h3 className="mt-5 text-[19px] font-semibold">Nothing planned yet</h3>
                <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
                  Set your budget, location, time and mood, then generate a full evening in one tap.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} />
    </div>
  )
}
