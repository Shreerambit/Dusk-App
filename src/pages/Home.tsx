import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CalendarRange, CheckCircle2, Compass, Flame, Gift, MessageCircle, Pause, Play, Shuffle, Sparkles,
} from 'lucide-react'
import { Button, GlassCard, Reveal } from '@/components/ui'
import { ActivityCard } from '@/components/ActivityCard'
import { RatingSheet } from '@/components/RatingSheet'
import { ComfortPicker } from '@/components/ConsentControls'
import { useApp } from '@/store/app'
import { DAILY_CHALLENGES } from '@/lib/data/quiz'
import { dayIndex, recommend, smartPick } from '@/lib/engine'
import { ease, spring } from '@/hooks/useMotionPrefs'
import type { Activity } from '@/lib/types'

export default function Home() {
  const comfort = useApp((s) => s.preferences.comfort)
  const gamification = useApp((s) => s.preferences.gamification)
  const streakPaused = useApp((s) => s.preferences.streakPaused)
  const setPrefs = useApp((s) => s.setPrefs)
  const history = useApp((s) => s.history)
  const favorites = useApp((s) => s.favorites)
  const signals = useApp((s) => s.signals)
  const streak = useApp((s) => s.streak)
  const level = useApp((s) => s.level)
  const complete = useApp((s) => s.complete)
  const notify = useApp((s) => s.notify)
  const profile = useApp((s) => s.profile)

  const [rating, setRating] = useState<Activity | null>(null)

  const daily = DAILY_CHALLENGES[dayIndex() % DAILY_CHALLENGES.length]
  const dailyKey = `daily-${new Date().toDateString()}`
  const dailyDone = history.some((h) => h.activityId === dailyKey)

  const picks = useMemo(
    () => recommend(signals(), comfort, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [comfort, history.length, favorites.length],
  )

  const lvl = level()
  const currentStreak = streak()

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 5) return 'Still up'
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    if (h < 22) return 'Good evening'
    return 'Late night'
  })()

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* ------------------------------------------------------------ hero */}
      <section>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-[14px] text-muted"
        >
          {greeting}{profile?.nickname ? `, ${profile.nickname}` : ''}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.05, ease }}
          className="display mt-2 text-[clamp(34px,7.5vw,62px)]"
        >
          What are you doing <span className="gradient-text">tonight?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease }}
          className="mt-3 text-[16px] text-muted sm:text-[17px]"
        >
          Spin. Discover. Laugh. Connect.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="mt-8"
        >
          <Link to="/app/spin" className="group relative block">
            <motion.div
              whileTap={{ scale: 0.975 }}
              transition={spring.snappy}
              className="relative overflow-hidden rounded-[30px] p-[1.5px]"
              style={{ background: 'linear-gradient(135deg,#ff6b8b,#e0436a 45%,#a84ae0)' }}
            >
              <div className="relative flex items-center justify-between gap-4 rounded-[29px] bg-[rgb(var(--bg))]/70 px-6 py-6 backdrop-blur-xl sm:px-8 sm:py-7">
                <div>
                  <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">Tonight</div>
                  <div className="display mt-1.5 text-[26px] sm:text-[32px]">SPIN THE NIGHT</div>
                </div>
                <motion.span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
                  style={{ background: 'linear-gradient(135deg,#ff6b8b,#a84ae0)' }}
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Shuffle size={24} className="text-white" />
                </motion.span>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { to: '/app/date', label: 'Plan a Date', icon: CalendarRange },
            { to: '/app/games', label: 'Play a Game', icon: Sparkles },
            { to: '/app/games?tab=ask', label: 'Ask a Question', icon: MessageCircle },
            { to: '/app/explore', label: 'Explore', icon: Compass },
          ].map((b, i) => (
            <motion.div
              key={b.to}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 + i * 0.06, ease }}
            >
              <Link
                to={b.to}
                className="flex h-full items-center gap-3 rounded-[22px] glass p-4 transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-white/[0.08] active:scale-[0.97] sm:flex-col sm:items-start sm:justify-between sm:gap-6"
              >
                <b.icon size={19} className="shrink-0 text-rose-300" />
                <span className="text-[13.5px] font-medium leading-tight">{b.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- daily challenge */}
      <Reveal>
        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-3xl"
            style={{ background: 'linear-gradient(135deg,#ff6b8b,#a84ae0)' }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">
              Today's couple challenge
            </div>
            {gamification && (
              <div className="flex items-center gap-2">
                <span className="chip gap-1.5">
                  <Flame size={12} className={currentStreak > 0 ? 'text-orange-300' : 'text-muted'} />
                  {streakPaused ? 'Streak paused' : `${currentStreak}-day streak`}
                </span>
                <button
                  onClick={() => setPrefs({ streakPaused: !streakPaused })}
                  className="chip gap-1.5 hover:bg-white/10 transition-colors"
                  aria-label={streakPaused ? 'Resume streak' : 'Pause streak'}
                >
                  {streakPaused ? <Play size={11} /> : <Pause size={11} />}
                  {streakPaused ? 'Resume' : 'Pause'}
                </button>
              </div>
            )}
          </div>

          <h2 className="display relative mt-4 text-[24px] sm:text-[28px]">{daily.title}</h2>
          <p className="relative mt-2.5 max-w-2xl text-[15px] leading-relaxed text-muted">{daily.text}</p>

          <div className="relative mt-6 flex flex-wrap gap-2.5">
            <Button
              variant={dailyDone ? 'ghost' : 'primary'}
              size="lg"
              disabled={dailyDone}
              icon={dailyDone ? <CheckCircle2 size={17} /> : undefined}
              onClick={() => {
                complete(
                  {
                    id: dailyKey, title: daily.title, category: 'romance', difficulty: 'easy',
                    duration: 20, location: 'anywhere', cost: 'free', mood: 'romantic',
                    participants: 2, tags: [], description: daily.text,
                  },
                  { rating: 5, reaction: 'loved' },
                )
                notify('Daily challenge completed')
              }}
            >
              {dailyDone ? 'Completed today' : 'Mark as done'}
            </Button>
            <Link to="/app/journey" className="btn btn-ghost h-13 px-6 py-3.5">Our journey</Link>
          </div>

          {gamification && (
            <div className="relative mt-6 border-t hairline pt-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium">Level {lvl.level} · {lvl.label}</span>
                <span className="text-muted">{useApp.getState().stats.points} pts</span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#ff6b8b,#a84ae0)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(lvl.progress * 100)}%` }}
                  transition={{ duration: 1, ease }}
                />
              </div>
            </div>
          )}
        </GlassCard>
      </Reveal>

      {/* ------------------------------------------------------- quick modes */}
      <Reveal>
        <div className="grid gap-3.5 sm:grid-cols-3">
          {[
            { to: '/app/surprise', title: 'Surprise us', body: 'Tell us your time and budget. We reveal the plan card by card.', icon: Gift },
            { to: '/app/weekend', title: 'Weekend mode', body: 'Morning to night, planned across the whole weekend.', icon: CalendarRange },
            { to: '/app/games', title: 'Couple games', body: 'Quizzes, Who Knows Who, and two-person games.', icon: Sparkles },
          ].map((m) => (
            <Link
              key={m.to}
              to={m.to}
              className="group rounded-[26px] glass p-5 transition-all duration-500 ease-spring hover:-translate-y-1 hover:bg-white/[0.08]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.07] text-rose-300">
                <m.icon size={18} />
              </span>
              <h3 className="mt-3.5 text-[16px] font-semibold">{m.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{m.body}</p>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* ---------------------------------------------------- recommendations */}
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="display text-[24px] sm:text-[30px]">You might like</h2>
            <p className="mt-1.5 text-[14px] text-muted">
              {history.length > 0
                ? 'Based on what you have rated and saved so far.'
                : 'A starting point. It gets sharper as you rate things.'}
            </p>
          </div>
          <Link to="/app/explore" className="hidden shrink-0 text-[13.5px] font-medium text-rose-300 hover:underline sm:block">
            See all
          </Link>
        </div>
        <div className="grid gap-3.5 md:grid-cols-3">
          {picks.map((a, i) => (
            <ActivityCard key={a.id} activity={a} index={i} onClick={() => setRating(a)} />
          ))}
        </div>
      </Reveal>

      {/* ---------------------------------------------------------- comfort */}
      <Reveal>
        <GlassCard className="p-6 sm:p-7">
          <h3 className="text-[17px] font-semibold">Comfort level</h3>
          <p className="mb-5 mt-1.5 text-[13.5px] leading-relaxed text-muted">
            This filters everything the app suggests. Change it any time — either of you can dial it back
            without explanation.
          </p>
          <ComfortPicker />
        </GlassCard>
      </Reveal>

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} />
    </div>
  )
}

/** Exported for reuse: a single "quick pick" for surfaces that want one idea. */
export function quickPick(comfort: Parameters<typeof smartPick>[0]['comfort']) {
  return smartPick({ comfort })
}
