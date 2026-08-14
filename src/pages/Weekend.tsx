import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, CalendarRange, CloudRain, RotateCcw, Sun } from 'lucide-react'
import type { Activity, Cost, Mood } from '@/lib/types'
import { Button, GlassCard, SegmentedControl } from '@/components/ui'
import { CategoryBadge, SaveButton } from '@/components/ActivityCard'
import { SessionControls } from '@/components/ConsentControls'
import { RatingSheet } from '@/components/RatingSheet'
import { useApp } from '@/store/app'
import { generateWeekend, type WeekendInputs } from '@/lib/engine'
import { formatDuration } from '@/lib/data/schema'
import { ease, spring, useReducedMotion } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'

const SLOT_STYLE: Record<string, { emoji: string; from: string; to: string }> = {
  Morning: { emoji: '🌅', from: '#ffd6a5', to: '#f0803c' },
  Afternoon: { emoji: '☀️', from: '#7dd3fc', to: '#4f79e8' },
  Evening: { emoji: '🌆', from: '#b79cff', to: '#7c53e8' },
  Night: { emoji: '🌙', from: '#ff8fb1', to: '#e0436a' },
}

export default function Weekend() {
  const comfort = useApp((s) => s.preferences.comfort)
  const signals = useApp((s) => s.signals)
  const toggleFavorite = useApp((s) => s.toggleFavorite)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()
  const reduced = useReducedMotion()

  const [budget, setBudget] = useState<Cost | 'any'>('low')
  const [distance, setDistance] = useState<WeekendInputs['distance']>('local')
  const [indoor, setIndoor] = useState<WeekendInputs['indoor']>('mixed')
  const [mood, setMood] = useState<Mood | 'any'>('any')
  const [weather, setWeather] = useState<WeekendInputs['weather']>('unknown')
  const [plan, setPlan] = useState<Array<{ label: string; activity: Activity }> | null>(null)
  const [rating, setRating] = useState<Activity | null>(null)

  function build() {
    feedback('reveal', [8, 30, 10])
    setPlan(generateWeekend({ budget, distance, indoor, mood, weather }, comfort, signals()))
  }

  return (
    <div className="pb-6">
      <header className="mb-8">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Weekend adventure</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          A full arc from morning to night. Adjust for weather and the plan adapts.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-7">
        <GlassCard className="h-fit space-y-6 p-6 lg:sticky lg:top-24">
          <SegmentedControl
            label="Budget"
            options={[{ value: 'free', label: 'Free' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'premium', label: 'Premium' }]}
            value={budget}
            onChange={setBudget}
            columns={2}
          />
          <SegmentedControl
            label="Distance"
            options={[{ value: 'home', label: 'Stay in' }, { value: 'local', label: 'Local' }, { value: 'roadtrip', label: 'Road trip' }]}
            value={distance}
            onChange={setDistance}
            columns={3}
          />
          <SegmentedControl
            label="Indoor or outdoor"
            options={[{ value: 'indoor', label: 'Indoor' }, { value: 'mixed', label: 'Mixed' }, { value: 'outdoor', label: 'Outdoor' }]}
            value={indoor}
            onChange={setIndoor}
            columns={3}
          />
          <SegmentedControl
            label="Mood"
            options={[
              { value: 'any', label: 'Any' }, { value: 'romantic', label: 'Romantic' }, { value: 'funny', label: 'Funny' },
              { value: 'relaxing', label: 'Relaxing' }, { value: 'adventurous', label: 'Adventurous' }, { value: 'cozy', label: 'Cozy' },
            ]}
            value={mood}
            onChange={setMood}
            columns={3}
          />
          <SegmentedControl
            label="Weather"
            options={[{ value: 'unknown', label: 'Not sure' }, { value: 'good', label: 'Clear' }, { value: 'bad', label: 'Wet' }]}
            value={weather}
            onChange={setWeather}
            columns={3}
          />

          {weather === 'bad' && (
            <p className="rounded-2xl bg-white/[0.05] p-3.5 text-[13px] leading-relaxed text-muted">
              Wet weather selected — the plan will favour indoor options.
            </p>
          )}

          <Button variant="primary" size="lg" full icon={<CalendarRange size={18} />} onClick={build}>
            {plan ? 'Regenerate weekend' : 'Plan our weekend'}
          </Button>
        </GlassCard>

        <div>
          <AnimatePresence mode="wait">
            {plan ? (
              <motion.div
                key={plan.map((p) => p.activity.id).join('-')}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={spring.soft}
                className="space-y-3"
              >
                {plan.map((slot, i) => {
                  const style = SLOT_STYLE[slot.label]
                  return (
                    <motion.div
                      key={slot.label}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.55, ease }}
                    >
                      <GlassCard className="relative overflow-hidden p-6">
                        <div
                          aria-hidden
                          className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-25 blur-3xl"
                          style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
                        />
                        <div className="relative flex items-start justify-between gap-3">
                          <span
                            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white"
                            style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
                          >
                            <span aria-hidden>{style.emoji}</span> {slot.label}
                          </span>
                          <SaveButton activity={slot.activity} />
                        </div>

                        <h3 className="display relative mt-4 text-[21px] sm:text-[24px]">{slot.activity.title}</h3>
                        <p className="relative mt-2.5 text-[14.5px] leading-relaxed text-muted">{slot.activity.description}</p>

                        <div className="relative mt-4 flex flex-wrap items-center gap-2">
                          <CategoryBadge id={slot.activity.category} />
                          <span className="chip">{formatDuration(slot.activity.duration)}</span>
                          <button onClick={() => setRating(slot.activity)} className="chip hover:bg-white/10 transition-colors">
                            Mark done
                          </button>
                        </div>
                      </GlassCard>

                      {i < plan.length - 1 && (
                        <div aria-hidden className="flex justify-center py-1">
                          <div className="h-6 w-px bg-gradient-to-b from-white/25 to-transparent" />
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <Button variant="primary" size="lg" icon={<RotateCcw size={16} />} onClick={build}>Regenerate</Button>
                  <Button
                    size="lg"
                    icon={<Bookmark size={16} />}
                    onClick={() => toggleFavorite({
                      kind: 'date',
                      title: 'Weekend plan',
                      subtitle: `${plan.length} parts · ${new Date().toLocaleDateString()}`,
                      payload: plan.map((p) => ({ label: p.label, title: p.activity.title })),
                    })}
                  >
                    Save weekend
                  </Button>
                </div>

                <SessionControls
                  className="pt-3"
                  onSkip={build}
                  onNotTonight={() => { setPlan(null); notify('Cleared') }}
                  onStop={() => { setPlan(null); notify('Session ended') }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[340px] flex-col items-center justify-center rounded-[28px] glass p-10 text-center"
              >
                <div className="flex gap-2 text-[26px]">
                  <span>🌅</span><span>☀️</span><span>🌆</span><span>🌙</span>
                </div>
                <h3 className="mt-5 text-[19px] font-semibold">Four parts, one weekend</h3>
                <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
                  Morning, afternoon, evening and night — generated to fit your budget and the forecast.
                </p>
                <div className="mt-5 flex gap-2 text-muted">
                  <Sun size={16} /><CloudRain size={16} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} />
    </div>
  )
}
