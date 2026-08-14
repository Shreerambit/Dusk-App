import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Gauge, Home, MapPin, PlayCircle, RotateCcw, Sparkles, Users, Wallet } from 'lucide-react'
import type { Activity, CategoryId } from '@/lib/types'
import { Button, GlassCard, SegmentedControl, Sheet } from '@/components/ui'
import { Wheel } from '@/components/Wheel'
import { CategoryBadge, SaveButton } from '@/components/ActivityCard'
import { ConsentCard, SessionControls } from '@/components/ConsentControls'
import { RatingSheet } from '@/components/RatingSheet'
import { useApp } from '@/store/app'
import { CATEGORIES, CATEGORY_MAP, COST_LABEL, DIFFICULTY_LABEL, LOCATION_LABEL, MOOD_LABEL, formatDuration } from '@/lib/data/schema'
import { availableCategories, smartCategory, smartPick } from '@/lib/engine'
import { ease, spring, useReducedMotion } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'

type Mode = 'all' | CategoryId

export default function Spin() {
  const comfort = useApp((s) => s.preferences.comfort)
  const signals = useApp((s) => s.signals)
  const registerSpin = useApp((s) => s.registerSpin)
  const skip = useApp((s) => s.skip)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()
  const reduced = useReducedMotion()

  const [consented, setConsented] = useState(false)
  const [mode, setMode] = useState<Mode>('all')
  const [result, setResult] = useState<Activity | null>(null)
  const [landed, setLanded] = useState<CategoryId | null>(null)
  const [started, setStarted] = useState(false)
  const [rating, setRating] = useState<Activity | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [wheelKey, setWheelKey] = useState(0)

  const seenRef = useRef<string[]>([])

  // Responsive wheel: fills small screens, larger and more legible on desktop.
  const [wheelSize, setWheelSize] = useState(340)
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth
      setWheelSize(Math.round(Math.max(260, Math.min(w >= 1024 ? 460 : w >= 640 ? 400 : w - 64, 460))))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const wheelCategories = useMemo(() => {
    const allowed = availableCategories(comfort)
    return CATEGORIES.filter((c) => allowed.includes(c.id))
  }, [comfort])

  const pickWinner = useCallback((): CategoryId => {
    registerSpin()
    if (mode !== 'all') return mode
    return smartCategory(wheelCategories.map((c) => c.id), signals())
  }, [mode, registerSpin, signals, wheelCategories])

  const revealActivity = useCallback(
    (category: CategoryId) => {
      const s = signals()
      const activity = smartPick(
        { categories: [category], comfort, excludeIds: [...seenRef.current, ...s.recentActivityIds.slice(0, 4)] },
        s,
      )
      seenRef.current = [activity.id, ...seenRef.current].slice(0, 24)
      setLanded(category)
      setResult(activity)
      setStarted(false)
    },
    [comfort, signals],
  )

  const nextInSameCategory = useCallback(() => {
    if (!landed) return
    feedback('tap')
    revealActivity(landed)
  }, [feedback, landed, revealActivity])

  function endSession() {
    setResult(null)
    setLanded(null)
    setStarted(false)
    seenRef.current = []
    notify('Session ended')
  }

  if (!consented) {
    return (
      <div className="mx-auto max-w-xl py-6">
        <header className="mb-7 text-center">
          <h1 className="display text-[clamp(30px,6.5vw,46px)]">Spin your night</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            Before you start, a quick agreement between the two of you.
          </p>
        </header>
        <ConsentCard onContinue={() => { feedback('confirm'); setConsented(true) }} />
      </div>
    )
  }

  return (
    <div className="pb-6">
      <header className="mb-7 text-center">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Spin your night</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">
          {mode === 'all' ? 'Every category in play.' : `Locked to ${CATEGORY_MAP[mode].label}.`}{' '}
          <button onClick={() => setPickerOpen(true)} className="font-medium text-rose-300 underline-offset-4 hover:underline">
            Change category
          </button>
        </p>
      </header>

      <div className="mx-auto flex max-w-xl justify-center">
        <Wheel
          key={wheelKey}
          categories={wheelCategories}
          pickWinner={pickWinner}
          onResult={revealActivity}
          size={wheelSize}
        />
      </div>

      {/* Legend — the wheel itself shows emoji only, so name them here. */}
      <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
        {wheelCategories.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => { feedback('tap'); setMode(c.id) }}
              className={`chip transition-all duration-300 ${mode === c.id ? 'border-transparent text-white' : 'hover:bg-white/10'}`}
              style={mode === c.id ? { background: `linear-gradient(135deg, ${c.from}, ${c.to})` } : undefined}
            >
              <span aria-hidden>{c.emoji}</span> {c.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 34, scale: 0.96, filter: 'blur(8px)' }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
              transition={spring.soft}
              className="mx-auto max-w-2xl"
            >
              <ChallengeCard
                activity={result}
                started={started}
                onStart={() => { feedback('confirm', [10, 40, 12]); setStarted(true) }}
                onFinish={() => setRating(result)}
                onSpinAgain={() => { feedback('tap'); setResult(null); setWheelKey((k) => k + 1) }}
                onSkip={() => { skip(result.id); feedback('tap'); nextInSameCategory() }}
              />

              <SessionControls
                className="mt-5"
                onSkip={() => { skip(result.id); nextInSameCategory() }}
                onNotTonight={() => { skip(result.id); notify('Noted — you will see less of this'); nextInSameCategory() }}
                onChangeCategory={() => setPickerOpen(true)}
                onStop={endSession}
              />
            </motion.div>
          )}

          {!result && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[14.5px] text-muted"
            >
              Tap the centre to spin. Nothing is ever forced — every result can be skipped.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* category picker */}
      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose a category">
        <div className="mb-5">
          <SegmentedControl
            label="Wheel mode"
            options={[{ value: 'all', label: 'All categories' }, { value: 'one', label: 'Just one' }]}
            value={mode === 'all' ? 'all' : 'one'}
            onChange={(v) => setMode(v === 'all' ? 'all' : wheelCategories[0].id)}
            columns={2}
          />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {wheelCategories.map((c) => {
            const active = mode === c.id
            return (
              <button
                key={c.id}
                onClick={() => { feedback('tap'); setMode(c.id); setPickerOpen(false) }}
                className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-300 ease-spring glass hover:bg-white/[0.09] ${active ? 'ring-2 ring-rose-400/70' : ''}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[18px]" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-medium">{c.label}</span>
                  <span className="block truncate text-[12.5px] text-muted">{c.blurb}</span>
                </span>
              </button>
            )
          })}
        </div>
        {wheelCategories.length < CATEGORIES.length && (
          <p className="mt-5 rounded-2xl bg-white/[0.04] p-4 text-[13px] leading-relaxed text-muted">
            Some categories are hidden at your current comfort level. Raise it in Profile if you both want
            bolder prompts.
          </p>
        )}
      </Sheet>

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} onDone={() => { setResult(null); setStarted(false) }} />
    </div>
  )
}

/* ------------------------------------------------------- challenge card */

function ChallengeCard({
  activity, started, onStart, onFinish, onSpinAgain, onSkip,
}: {
  activity: Activity
  started: boolean
  onStart: () => void
  onFinish: () => void
  onSpinAgain: () => void
  onSkip: () => void
}) {
  const c = CATEGORY_MAP[activity.category]

  const meta = [
    { icon: Gauge, label: 'Difficulty', value: DIFFICULTY_LABEL[activity.difficulty] },
    { icon: Clock, label: 'Time', value: formatDuration(activity.duration) },
    { icon: activity.location === 'home' ? Home : MapPin, label: 'Where', value: LOCATION_LABEL[activity.location] },
    { icon: Sparkles, label: 'Mood', value: MOOD_LABEL[activity.mood] },
    { icon: Wallet, label: 'Cost', value: COST_LABEL[activity.cost] },
    { icon: Users, label: 'People', value: String(activity.participants) },
  ]

  return (
    <GlassCard className="relative overflow-hidden p-6 sm:p-8">
      <div
        aria-hidden
        className="absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
            Tonight's challenge
          </div>
          <div className="mt-3"><CategoryBadge id={activity.category} /></div>
        </div>
        <SaveButton activity={activity} />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease }}
        className="display relative mt-5 text-[clamp(26px,5.4vw,40px)]"
      >
        {activity.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.17, duration: 0.6, ease }}
        className="relative mt-3.5 max-w-xl text-[15.5px] leading-relaxed text-muted"
      >
        {activity.description}
      </motion.p>

      <div className="relative mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {meta.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04, duration: 0.5, ease }}
            className="rounded-2xl bg-white/[0.05] p-3.5"
          >
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
              <m.icon size={12} /> {m.label}
            </div>
            <div className="mt-1 text-[14.5px] font-medium">{m.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-7 flex flex-wrap gap-2.5">
        {!started ? (
          <Button variant="primary" size="lg" icon={<PlayCircle size={18} />} onClick={onStart} className="flex-1 min-w-[140px]">
            Start
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={onFinish} className="flex-1 min-w-[140px]">
            We did it
          </Button>
        )}
        <Button size="lg" icon={<RotateCcw size={16} />} onClick={onSpinAgain}>Spin again</Button>
        <Button size="lg" onClick={onSkip}>Skip</Button>
      </div>

      {started && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.45, ease }}
          className="relative mt-5 overflow-hidden"
        >
          <div className="rounded-2xl bg-emerald-400/10 p-4 text-[13.5px] leading-relaxed text-emerald-200/90">
            In progress. Take your time — mark it done when you are ready, or stop whenever either of you wants.
          </div>
        </motion.div>
      )}
    </GlassCard>
  )
}
