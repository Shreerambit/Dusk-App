import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, RotateCcw, Sparkles } from 'lucide-react'
import type { Activity, Cost, LocationKind } from '@/lib/types'
import { Button, GlassCard, SegmentedControl } from '@/components/ui'
import { CategoryBadge, SaveButton } from '@/components/ActivityCard'
import { SessionControls } from '@/components/ConsentControls'
import { RatingSheet } from '@/components/RatingSheet'
import { useApp } from '@/store/app'
import { generateSurprise } from '@/lib/engine'
import { formatDuration } from '@/lib/data/schema'
import { ease, spring, useReducedMotion } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'

export default function Surprise() {
  const comfort = useApp((s) => s.preferences.comfort)
  const signals = useApp((s) => s.signals)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()
  const reduced = useReducedMotion()

  const [minutes, setMinutes] = useState('60')
  const [budget, setBudget] = useState<Cost | 'any'>('low')
  const [location, setLocation] = useState<LocationKind | 'anywhere'>('anywhere')

  const [cards, setCards] = useState<Activity[] | null>(null)
  const [revealed, setRevealed] = useState(0)
  const [rating, setRating] = useState<Activity | null>(null)

  function generate() {
    feedback('reveal', [8, 30, 10])
    setCards(generateSurprise({ minutes: Number(minutes), budget, location }, comfort, signals()))
    setRevealed(0)
  }

  function revealNext() {
    feedback('confirm', [10, 30, 10])
    setRevealed((r) => r + 1)
  }

  const allRevealed = cards ? revealed >= cards.length : false

  return (
    <div className="pb-6">
      <header className="mb-8">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Surprise us</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Tell us three things. We will not tell you everything at once.
        </p>
      </header>

      {!cards ? (
        <GlassCard className="mx-auto max-w-xl space-y-6 p-6 sm:p-8">
          <SegmentedControl
            label="Available time"
            options={[
              { value: '30', label: '30 min' }, { value: '60', label: '1 hour' },
              { value: '120', label: '2 hours' }, { value: '300', label: 'Full evening' },
            ]}
            value={minutes}
            onChange={setMinutes}
            columns={2}
          />
          <SegmentedControl
            label="Budget"
            options={[{ value: 'free', label: 'Free' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'premium', label: 'Premium' }]}
            value={budget}
            onChange={setBudget}
            columns={2}
          />
          <SegmentedControl
            label="Location"
            options={[
              { value: 'anywhere', label: 'Anywhere' }, { value: 'home', label: 'Home' },
              { value: 'outdoors', label: 'Outdoors' }, { value: 'venue', label: 'Out' },
            ]}
            value={location}
            onChange={setLocation}
            columns={2}
          />

          <Button variant="primary" size="lg" full icon={<Gift size={18} />} onClick={generate}>
            Surprise us
          </Button>
        </GlassCard>
      ) : (
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 flex items-center justify-between text-[13.5px] text-muted">
            <span>{revealed} of {cards.length} revealed</span>
            <button
              onClick={() => { setCards(null); setRevealed(0) }}
              className="font-medium text-rose-300 hover:underline"
            >
              Start over
            </button>
          </div>

          <div className="space-y-3.5">
            {cards.map((a, i) => {
              const isRevealed = i < revealed
              const isNext = i === revealed
              return (
                <motion.div key={a.id} layout transition={spring.soft}>
                  <AnimatePresence mode="wait">
                    {isRevealed ? (
                      <motion.div
                        key="front"
                        initial={reduced ? { opacity: 0 } : { rotateY: -92, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ duration: 0.6, ease }}
                        style={{ transformPerspective: 1200 }}
                      >
                        <GlassCard className="relative overflow-hidden p-6 sm:p-7">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                              Part {i + 1}
                            </span>
                            <SaveButton activity={a} />
                          </div>
                          <h2 className="display mt-3 text-[24px] sm:text-[28px]">{a.title}</h2>
                          <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{a.description}</p>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <CategoryBadge id={a.category} />
                            <span className="chip">{formatDuration(a.duration)}</span>
                            <button onClick={() => setRating(a)} className="chip hover:bg-white/10 transition-colors">
                              Mark done
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="back"
                        onClick={isNext ? revealNext : undefined}
                        disabled={!isNext}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: isNext ? 1 : 0.5, y: 0 }}
                        whileHover={isNext && !reduced ? { y: -3 } : undefined}
                        whileTap={isNext ? { scale: 0.98 } : undefined}
                        transition={spring.soft}
                        className="relative block w-full overflow-hidden rounded-[28px] p-[1.5px] disabled:cursor-not-allowed"
                        style={{ background: isNext ? 'linear-gradient(135deg,#ff6b8b,#a84ae0)' : 'rgba(255,255,255,.08)' }}
                      >
                        <div className="flex items-center justify-between gap-4 rounded-[27px] bg-[rgb(var(--bg))]/80 px-6 py-8 backdrop-blur-xl">
                          <div className="text-left">
                            <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                              Part {i + 1}
                            </div>
                            <div className="display mt-1.5 text-[20px]">
                              {isNext ? 'Tap to reveal' : 'Locked until the last one'}
                            </div>
                          </div>
                          <motion.span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full glass"
                            animate={isNext && !reduced ? { scale: [1, 1.08, 1] } : {}}
                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <Sparkles size={20} className={isNext ? 'text-rose-300' : 'text-muted'} />
                          </motion.span>
                        </div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {allRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mt-6 flex flex-wrap gap-2.5"
            >
              <Button variant="primary" size="lg" icon={<RotateCcw size={16} />} onClick={generate}>
                Another surprise
              </Button>
              <Button size="lg" onClick={() => { setCards(null); setRevealed(0); notify('Cleared') }}>Change inputs</Button>
            </motion.div>
          )}

          <SessionControls
            className="mt-5"
            onSkip={generate}
            onNotTonight={() => { setCards(null); setRevealed(0) }}
            onStop={() => { setCards(null); setRevealed(0); notify('Session ended') }}
          />
        </div>
      )}

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} />
    </div>
  )
}
