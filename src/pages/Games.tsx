import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Bookmark, Check, RotateCcw, Shuffle, Users } from 'lucide-react'
import type { Activity, QuizQuestion } from '@/lib/types'
import { Button, GlassCard, SegmentedControl } from '@/components/ui'
import { SaveButton, CategoryBadge } from '@/components/ActivityCard'
import { SessionControls } from '@/components/ConsentControls'
import { RatingSheet } from '@/components/RatingSheet'
import { useApp } from '@/store/app'
import { QUIZ_QUESTIONS, WHO_QUESTIONS } from '@/lib/data/quiz'
import { shuffle, smartPick, sessionCode } from '@/lib/engine'
import { ease, spring, useReducedMotion } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'

type Tab = 'quiz' | 'who' | 'ask' | 'play'

export default function Games() {
  const [params, setParams] = useSearchParams()
  const initial = (params.get('tab') as Tab) || 'quiz'
  const [tab, setTab] = useState<Tab>(['quiz', 'who', 'ask', 'play'].includes(initial) ? initial : 'quiz')

  useEffect(() => {
    setParams(tab === 'quiz' ? {} : { tab }, { replace: true })
  }, [tab, setParams])

  return (
    <div className="pb-6">
      <header className="mb-7">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Couple games</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Made for two people and one device. Pass it back and forth.
        </p>
      </header>

      <div className="mb-7">
        <SegmentedControl
          options={[
            { value: 'quiz', label: 'Know you' },
            { value: 'who', label: 'Who knows who' },
            { value: 'ask', label: 'Ask' },
            { value: 'play', label: 'Play' },
          ]}
          value={tab}
          onChange={setTab}
          columns={4}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease }}
        >
          {tab === 'quiz' && <Quiz />}
          {tab === 'who' && <WhoKnowsWho />}
          {tab === 'ask' && <AskDeck />}
          {tab === 'play' && <PlayDeck />}
        </motion.div>
      </AnimatePresence>

      <PartnerSync />
    </div>
  )
}

/* ------------------------------------------------------------------ quiz */

type Phase = 'intro' | 'a' | 'handoff' | 'b' | 'results'

function Quiz() {
  const reduced = useReducedMotion()
  const feedback = useFeedback()
  const toggleFavorite = useApp((s) => s.toggleFavorite)

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => shuffle(QUIZ_QUESTIONS).slice(0, 6))
  const [phase, setPhase] = useState<Phase>('intro')
  const [idx, setIdx] = useState(0)
  const [answersA, setAnswersA] = useState<Record<string, string>>({})
  const [answersB, setAnswersB] = useState<Record<string, string>>({})

  const current = questions[idx]
  const answering = phase === 'a' ? 'A' : 'B'

  function answer(option: string) {
    feedback('tap')
    if (phase === 'a') setAnswersA((p) => ({ ...p, [current.id]: option }))
    else setAnswersB((p) => ({ ...p, [current.id]: option }))

    if (idx + 1 < questions.length) {
      setIdx(idx + 1)
    } else if (phase === 'a') {
      setPhase('handoff')
      setIdx(0)
    } else {
      feedback('success', [10, 40, 12])
      setPhase('results')
    }
  }

  function restart() {
    setQuestions(shuffle(QUIZ_QUESTIONS).slice(0, 6))
    setAnswersA({}); setAnswersB({}); setIdx(0); setPhase('intro')
  }

  const matches = questions.filter((q) => answersA[q.id] && answersA[q.id] === answersB[q.id]).length

  if (phase === 'intro') {
    return (
      <GlassCard className="p-7 sm:p-9">
        <h2 className="display text-[26px] sm:text-[32px]">How well do you know each other?</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Six questions. Partner A answers first, then hands the device over. Partner B answers the same
          questions, and you compare side by side.
        </p>
        <div className="mt-6 rounded-2xl bg-white/[0.04] p-4 text-[13px] leading-relaxed text-muted">
          This is a conversation starter, not a scientifically validated compatibility test. Differences are
          interesting, not a problem.
        </div>
        <Button variant="primary" size="lg" className="mt-6" icon={<Users size={17} />} onClick={() => { feedback('tap'); setPhase('a') }}>
          Partner A, start
        </Button>
      </GlassCard>
    )
  }

  if (phase === 'handoff') {
    return (
      <GlassCard className="p-9 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring.soft}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-purple-500 text-[22px] font-bold text-white"
        >
          B
        </motion.div>
        <h2 className="display mt-5 text-[26px]">Pass the phone</h2>
        <p className="mx-auto mt-2.5 max-w-sm text-[14.5px] leading-relaxed text-muted">
          Partner A is done — their answers are hidden. Hand the device to Partner B.
        </p>
        <Button variant="primary" size="lg" className="mt-6" onClick={() => { feedback('tap'); setPhase('b') }}>
          I'm Partner B
        </Button>
      </GlassCard>
    )
  }

  if (phase === 'results') {
    return (
      <div className="space-y-4">
        <GlassCard className="p-7 text-center">
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">Results</div>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={spring.soft}
            className="display mt-3 text-[56px] gradient-text"
          >
            {matches}/{questions.length}
          </motion.div>
          <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-muted">
            {matches === questions.length
              ? 'Identical answers across the board. Slightly suspicious.'
              : matches === 0
                ? 'Completely different answers — plenty to talk about tonight.'
                : 'A mix of matches and differences. The differences are the interesting part.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button variant="primary" icon={<RotateCcw size={15} />} onClick={restart}>Play again</Button>
            <Button
              icon={<Bookmark size={15} />}
              onClick={() => toggleFavorite({
                kind: 'game',
                title: 'Quiz result',
                subtitle: `${matches}/${questions.length} matched · ${new Date().toLocaleDateString()}`,
              })}
            >
              Save result
            </Button>
          </div>
        </GlassCard>

        {questions.map((q, i) => {
          const match = answersA[q.id] === answersB[q.id]
          return (
            <motion.div
              key={q.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
            >
              <GlassCard className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] font-medium leading-snug">{q.prompt}</h3>
                  <span className={`chip shrink-0 ${match ? 'text-rose-200' : 'text-amber-200'}`}>
                    {match ? 'Match ❤️' : 'Difference 👀'}
                  </span>
                </div>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {[['Partner A', answersA[q.id]], ['Partner B', answersB[q.id]]].map(([who, ans]) => (
                    <div key={who} className="rounded-2xl bg-white/[0.05] p-3.5">
                      <div className="text-[11.5px] uppercase tracking-wide text-muted">{who}</div>
                      <div className="mt-1 text-[14.5px] font-medium">{ans}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="flex items-center justify-between text-[13px] text-muted">
        <span>Partner {answering}</span>
        <span>{idx + 1} of {questions.length}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#ff6b8b,#a84ae0)' }}
          animate={{ width: `${((idx + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.45, ease }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${answering}-${current.id}`}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -26 }}
          transition={{ duration: 0.32, ease }}
        >
          <h2 className="display mt-7 text-[22px] sm:text-[27px]">{current.prompt}</h2>
          <div className="mt-6 space-y-2.5">
            {current.options.map((o) => (
              <button
                key={o}
                onClick={() => answer(o)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl glass p-4 text-left text-[15px] transition-all duration-300 ease-spring hover:bg-white/[0.1] active:scale-[0.985]"
              >
                {o}
                <ArrowRight size={16} className="shrink-0 text-muted" />
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <SessionControls
        className="mt-6"
        onSkip={() => (idx + 1 < questions.length ? setIdx(idx + 1) : phase === 'a' ? (setPhase('handoff'), setIdx(0)) : setPhase('results'))}
        onNotTonight={restart}
        onStop={restart}
      />
    </GlassCard>
  )
}

/* --------------------------------------------------------- who knows who */

function WhoKnowsWho() {
  const feedback = useFeedback()
  const reduced = useReducedMotion()
  const [deck, setDeck] = useState(() => shuffle(WHO_QUESTIONS))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<'A' | 'B' | 'both' | null>(null)
  const [tally, setTally] = useState({ A: 0, B: 0, both: 0 })

  const q = deck[i % deck.length]

  function choose(who: 'A' | 'B' | 'both') {
    feedback('reveal', [8, 30, 10])
    setPicked(who)
    setTally((t) => ({ ...t, [who]: t[who] + 1 }))
  }

  function next() {
    feedback('tap')
    setPicked(null)
    setI((n) => n + 1)
  }

  return (
    <div>
      <GlassCard className="relative overflow-hidden p-7 sm:p-9">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
          Who knows who · card {(i % deck.length) + 1}
        </div>

        <AnimatePresence mode="wait">
          <motion.h2
            key={q.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, rotateX: -32, y: 20 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: 24, y: -16 }}
            transition={{ duration: 0.45, ease }}
            className="display mt-4 text-[clamp(24px,5.4vw,38px)]"
            style={{ transformPerspective: 900 }}
          >
            {q.prompt}
          </motion.h2>
        </AnimatePresence>

        <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
          {(['A', 'B', 'both'] as const).map((who) => {
            const active = picked === who
            return (
              <motion.button
                key={who}
                whileTap={{ scale: 0.96 }}
                transition={spring.snappy}
                onClick={() => choose(who)}
                disabled={!!picked}
                className={`rounded-[22px] p-5 text-center transition-all duration-300 ${
                  active ? 'text-white' : 'glass hover:bg-white/[0.09]'
                } ${picked && !active ? 'opacity-40' : ''}`}
                style={active ? { background: 'linear-gradient(135deg,#ff6b8b,#a84ae0)' } : undefined}
              >
                <div className="text-[20px] font-bold">
                  {who === 'both' ? 'Both' : `Partner ${who}`}
                </div>
                <div className="mt-1 text-[12.5px] opacity-80">{tally[who]} so far</div>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {picked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease }}
              className="overflow-hidden"
            >
              <div className="mt-6 rounded-2xl bg-white/[0.05] p-4 text-[14px] leading-relaxed text-muted">
                Did you both agree? If not, that is the more interesting conversation. Say why.
              </div>
              <Button variant="primary" size="lg" full className="mt-4" icon={<ArrowRight size={17} />} onClick={next}>
                Next card
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <SessionControls
        className="mt-5"
        onSkip={next}
        onNotTonight={next}
        onStop={() => { setDeck(shuffle(WHO_QUESTIONS)); setI(0); setPicked(null); setTally({ A: 0, B: 0, both: 0 }) }}
      />
    </div>
  )
}

/* -------------------------------------------------------------- ask deck */

function AskDeck() {
  return <Deck categories={['conversation', 'know']} title="Ask a question" blurb="One question at a time. Take the long answer, not the short one." />
}

function PlayDeck() {
  return <Deck categories={['games', 'chemistry']} title="Play something" blurb="Short two-person games that need nothing but the two of you." />
}

function Deck({ categories, title, blurb }: { categories: Activity['category'][]; title: string; blurb: string }) {
  const comfort = useApp((s) => s.preferences.comfort)
  const signals = useApp((s) => s.signals)
  const skip = useApp((s) => s.skip)
  const feedback = useFeedback()
  const reduced = useReducedMotion()

  const seen = useMemo(() => [] as string[], [])
  const [card, setCard] = useState<Activity | null>(null)
  const [rating, setRating] = useState<Activity | null>(null)

  function draw() {
    feedback('tap')
    const a = smartPick({ categories, comfort, excludeIds: seen }, signals())
    seen.unshift(a.id)
    if (seen.length > 20) seen.pop()
    setCard(a)
  }

  useEffect(() => { if (!card) draw() /* eslint-disable-next-line */ }, [])

  return (
    <div>
      <GlassCard className="relative overflow-hidden p-7 sm:p-9">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">{title}</div>
        <p className="mt-2 text-[13.5px] text-muted">{blurb}</p>

        <AnimatePresence mode="wait">
          {card && (
            <motion.div
              key={card.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.98 }}
              transition={spring.soft}
            >
              <div className="mt-6 flex items-start justify-between gap-3">
                <CategoryBadge id={card.category} />
                <SaveButton activity={card} />
              </div>
              <h2 className="display mt-4 text-[clamp(22px,5vw,34px)]">{card.title}</h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{card.description}</p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <Button variant="primary" size="lg" icon={<Shuffle size={17} />} onClick={draw}>Next card</Button>
                <Button size="lg" icon={<Check size={16} />} onClick={() => setRating(card)}>We did it</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <SessionControls
        className="mt-5"
        onSkip={() => { if (card) skip(card.id); draw() }}
        onNotTonight={() => { if (card) skip(card.id); draw() }}
        onStop={() => setCard(null)}
      />

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} onDone={draw} />
    </div>
  )
}

/* ---------------------------------------------------------- partner sync */

function PartnerSync() {
  const session = useApp((s) => s.session)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()
  const [code, setCode] = useState(session?.code ?? '')

  return (
    <GlassCard className="mt-8 p-6">
      <h3 className="text-[16px] font-semibold">Couple mode</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
        Everything here already works for two people on one device. Partner Sync — where a second phone
        joins with a code — is scaffolded and will light up when cloud sync is enabled.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <code className="rounded-xl bg-white/[0.07] px-4 py-2.5 font-mono text-[15px] tracking-[0.12em]">
          {code || '––––-––'}
        </code>
        <Button
          onClick={() => {
            const c = sessionCode()
            setCode(c)
            feedback('confirm')
            notify('Session code generated (local preview)')
          }}
        >
          Generate code
        </Button>
      </div>
    </GlassCard>
  )
}
