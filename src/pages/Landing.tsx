import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, CalendarRange, Compass, Dices, Flame, Gift, Heart, Lock, MessageCircle,
  Moon, Shuffle, Sparkles, Wand2,
} from 'lucide-react'
import { Reveal, SectionTitle } from '@/components/ui'
import { CATEGORIES } from '@/lib/data/schema'
import { ACTIVITIES } from '@/lib/data/activities'
import { DAILY_CHALLENGES } from '@/lib/data/quiz'
import { dayIndex } from '@/lib/engine'
import { useReducedMotion, ease } from '@/hooks/useMotionPrefs'

export default function Landing() {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : 90])
  const heroFade = useTransform(scrollY, [0, 420], [1, reduced ? 1 : 0.35])
  const daily = DAILY_CHALLENGES[dayIndex() % DAILY_CHALLENGES.length]

  return (
    <div className="relative">
      {/* ---------------------------------------------------------- nav */}
      <header className="sticky top-0 z-50 pt-4">
        <div className="mx-auto flex w-[min(1180px,94vw)] items-center justify-between rounded-full glass px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg,#ff6b8b,#7c53e8)' }}>
              <Heart size={16} className="text-white" fill="white" />
            </span>
            <span className="text-[16px] font-semibold tracking-tight">Dusk</span>
            <span className="ml-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-muted">18+</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {[['Spin', '#spin'], ['Categories', '#categories'], ['How it works', '#how'], ['Date', '#date'], ['Privacy', '#privacy']].map(([label, href]) => (
              <a key={href} href={href} className="rounded-full px-3.5 py-2 text-[13.5px] text-muted transition-colors hover:text-[rgb(var(--text))]">
                {label}
              </a>
            ))}
          </nav>
          <Link to="/app" className="btn btn-primary h-10 px-5 text-[14px]">
            Open app
          </Link>
        </div>
      </header>

      {/* --------------------------------------------------------- hero */}
      <section className="relative mx-auto flex w-[min(1180px,94vw)] flex-col items-center pb-16 pt-14 text-center sm:pt-24">
        <motion.div style={{ y: heroY, opacity: heroFade }} className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="chip mb-7 gap-2 px-4 py-2"
          >
            <Sparkles size={13} className="text-rose-300" />
            <span className="text-[12.5px]">{ACTIVITIES.length}+ ideas · nothing leaves your device</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.06, ease }}
            className="display text-[clamp(40px,9vw,92px)] max-w-4xl"
          >
            What are you doing <span className="gradient-text">tonight?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.16, ease }}
            className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted sm:text-[19px]"
          >
            Spin. Discover. Laugh. Connect. A private companion for couples who are done with
            "I don't know, what do you want to do?"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.26, ease }}
            className="mt-10 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
          >
            <Link to="/app/spin" className="btn btn-primary h-[60px] w-full px-9 text-[17px] font-semibold sm:w-auto">
              <Shuffle size={19} />
              Spin the night
            </Link>
            <Link to="/app" className="btn btn-ghost h-[60px] w-full px-8 text-[16px] sm:w-auto">
              Explore the app
              <ArrowRight size={17} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-muted"
          >
            <span className="flex items-center gap-1.5"><Lock size={12} /> No account needed</span>
            <span className="flex items-center gap-1.5"><Heart size={12} /> Consent-first</span>
            <span className="flex items-center gap-1.5"><Moon size={12} /> Nothing graphic</span>
          </motion.div>
        </motion.div>

        <HeroCards />
      </section>

      {/* --------------------------------------------------- spin section */}
      <Section id="spin">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionTitle
              eyebrow="The core loop"
              title="Spin your night"
              subtitle="Pick a mood, spin a beautifully weighted wheel and get one clear thing to do together. The randomiser remembers what you have already seen, so it never loops back on itself."
            />
            <ul className="mt-8 space-y-3.5">
              {[
                'Smart randomisation that avoids repeats and varies the category',
                'Difficulty, duration, cost, indoor or outdoor — all on the card',
                'Skip, save or start. Nothing is ever forced',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] text-muted">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/app/spin" className="btn btn-primary mt-8 h-13 px-7 py-3.5 text-[15.5px]">
              Try the wheel <ArrowRight size={16} />
            </Link>
          </Reveal>

          <Reveal delay={0.12}>
            <WheelPreview />
          </Reveal>
        </div>
      </Section>

      {/* --------------------------------------------------- categories */}
      <Section id="categories">
        <Reveal>
          <SectionTitle center eyebrow="Nine worlds" title="Choose your kind of night" subtitle="Every category is written for consenting adults and stays romantic or playful — never graphic." />
        </Reveal>
        <div className="mt-12 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link
                to="/app/spin"
                className="group relative block h-full overflow-hidden rounded-[26px] glass p-6 transition-transform duration-500 ease-spring hover:-translate-y-1"
              >
                <div
                  aria-hidden
                  className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-[20px]" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                  <span aria-hidden>{c.emoji}</span>
                </div>
                <h3 className="relative mt-4 text-[17px] font-semibold">{c.label}</h3>
                <p className="relative mt-1.5 text-[14px] leading-relaxed text-muted">{c.blurb}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------ how it works */}
      <Section id="how">
        <Reveal>
          <SectionTitle center eyebrow="How it works" title="Three steps, then put the phone down" />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { n: '01', title: 'Choose your mood', body: 'Set a comfort level you both agree on — relaxed, playful, romantic or adventurous.', icon: Heart },
            { n: '02', title: 'Spin or generate', body: 'Spin the wheel, build a full date, or let Surprise Us plan the whole evening for you.', icon: Wand2 },
            { n: '03', title: 'Enjoy the moment', body: 'Start it, rate it afterwards, and let the app learn what actually works for the two of you.', icon: Sparkles },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <StepCard {...s} index={i} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------- date generator */}
      <Section id="date">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="rounded-[30px] glass p-6 sm:p-8">
              <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Tonight's plan</div>
              <div className="mt-5 space-y-3">
                {[
                  ['Start with', 'Sunset Rooftop Drink', '90 min'],
                  ['Then', 'Twenty Questions, Ourselves Edition', '20 min'],
                  ['Next', 'Explore a New Neighbourhood', '2 hr'],
                  ['Finish with', 'Midnight Walk', '40 min'],
                ].map(([label, title, time], i) => (
                  <div key={title} className="flex items-center gap-4 rounded-2xl bg-white/[0.05] p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-purple-500 text-[12px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11.5px] uppercase tracking-wide text-muted">{label}</div>
                      <div className="truncate text-[15px] font-medium">{title}</div>
                    </div>
                    <span className="shrink-0 text-[12.5px] text-muted">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <SectionTitle
              eyebrow="Build our date"
              title="A whole evening, planned in four taps"
              subtitle="Set a budget, a location, how long you have and the mood you are in. Dusk assembles a sequenced plan that actually fits the time you gave it."
            />
            <div className="mt-7 flex flex-wrap gap-2">
              {['Free', 'Low', 'Medium', 'Premium', 'Home', 'Outdoors', 'Restaurant', '15 min', 'Full evening', 'Weekend', 'Cozy', 'Adventurous'].map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
            <Link to="/app/date" className="btn btn-primary mt-8 h-13 px-7 py-3.5 text-[15.5px]">
              Build our date <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* --------------------------------------------------------- games */}
      <Section>
        <Reveal>
          <SectionTitle center eyebrow="Couple games" title="Games that need two people and no equipment" />
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Dices, title: 'How well do you know each other?', body: 'Both answer independently on one device, then reveal side by side. Match, or an interesting difference.', to: '/app/games' },
            { icon: MessageCircle, title: 'Who knows who?', body: 'Who apologises first? Who takes longer to get ready? Animated reveal cards, one tap each.', to: '/app/games' },
            { icon: Flame, title: 'Challenge decks', body: 'Swipeable prompt cards across every category, with skip and save always one tap away.', to: '/app/explore' },
          ].map((g, i) => (
            <Reveal key={g.title} delay={i * 0.08}>
              <Link to={g.to} className="group block h-full rounded-[26px] glass p-6 transition-transform duration-500 ease-spring hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07] text-rose-300">
                  <g.icon size={20} />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold">{g.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{g.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-rose-300">
                  Play <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------- daily + weekend */}
      <Section>
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[30px] glass p-7 sm:p-9">
              <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">Today's couple challenge</div>
              <h3 className="display mt-4 text-[26px]">{daily.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{daily.text}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <span className="chip">7-Day Connection Streak</span>
                <span className="chip">Pausable, guilt-free</span>
              </div>
              <Link to="/app" className="btn btn-ghost mt-7 h-11 px-6">Open today's challenge</Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-[30px] glass p-7 sm:p-9">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.07] text-purple-300">
                <CalendarRange size={20} />
              </span>
              <h3 className="display mt-4 text-[26px]">Weekend adventure</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                A full two-day arc: morning, afternoon, evening, night. Tune budget, distance,
                indoor or outdoor, and swap in a wet-weather plan when the forecast turns.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
              <Link to="/app/weekend" className="btn btn-ghost mt-7 h-11 px-6">Plan a weekend</Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* -------------------------------------------------------- explore */}
      <Section>
        <Reveal>
          <SectionTitle center eyebrow="Explore" title="Keep discovering" subtitle="Eighteen tags, endless scrolling, and a Surprise Us mode that reveals your night one card at a time." />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {['Romantic', 'Funny', 'Adventurous', 'Relaxing', 'Creative', 'Food', 'Travel', 'Games', 'Conversation', 'Memories', 'Fitness', 'Movies', 'Music', 'Photography', 'DIY', 'Learning', 'Outdoor', 'Indoor'].map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.025, ease }}
                className="chip px-4 py-2.5 text-[13.5px]"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/app/explore" className="btn btn-ghost h-13 px-7 py-3.5"><Compass size={17} /> Browse everything</Link>
            <Link to="/app/surprise" className="btn btn-primary h-13 px-7 py-3.5"><Gift size={17} /> Surprise us</Link>
          </div>
        </Reveal>
      </Section>

      {/* -------------------------------------------------------- privacy */}
      <Section id="privacy">
        <Reveal>
          <div className="rounded-[32px] glass p-8 sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <SectionTitle eyebrow="Privacy" title="Built to stay between the two of you" subtitle="No account, no analytics, no server. Everything you save lives in this browser and you can wipe it in one tap." />
                <div className="mt-7 flex flex-wrap gap-2.5">
                  <Link to="/app/privacy" className="btn btn-ghost h-11 px-6">Privacy controls</Link>
                  <Link to="/app/profile" className="btn btn-ghost h-11 px-6">Private mode</Link>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  ['Private Mode', 'Blurs previews, hides your history and re-locks after inactivity.'],
                  ['Your data, portable', 'Export everything as JSON, or delete history, favourites and all local data.'],
                  ['Quiet notifications', 'If you ever enable them, they only ever say "Your couple challenge is ready."'],
                  ['Honest limits', 'Browsers cannot prevent screenshots. We tell you rather than pretending otherwise.'],
                ].map(([t, b]) => (
                  <li key={t} className="rounded-2xl bg-white/[0.04] p-4">
                    <div className="text-[15px] font-medium">{t}</div>
                    <div className="mt-1 text-[13.5px] leading-relaxed text-muted">{b}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ------------------------------------------------------------ cta */}
      <Section>
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] glass px-6 py-16 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(224,67,106,.5), transparent 70%)' }} />
            <h2 className="display relative text-[clamp(30px,6vw,58px)]">
              Let's see what you get <span className="gradient-text">next.</span>
            </h2>
            <p className="relative mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
              One spin is all it takes to stop scrolling and start doing something together.
            </p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/app/spin" className="btn btn-primary h-[58px] w-full px-9 text-[16.5px] font-semibold sm:w-auto">
                <Shuffle size={18} /> Spin the night
              </Link>
              <Link to="/app" className="btn btn-ghost h-[58px] w-full px-8 text-[16px] sm:w-auto">Open the app</Link>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* --------------------------------------------------------- footer */}
      <footer className="mx-auto mt-8 w-[min(1180px,94vw)] border-t hairline py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg,#ff6b8b,#7c53e8)' }}>
              <Heart size={13} className="text-white" fill="white" />
            </span>
            <span className="text-[14.5px] font-semibold">Dusk</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-muted">18+</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13.5px] text-muted" aria-label="Footer">
            <Link to="/app" className="hover:text-[rgb(var(--text))] transition-colors">App</Link>
            <Link to="/app/explore" className="hover:text-[rgb(var(--text))] transition-colors">Explore</Link>
            <Link to="/app/privacy" className="hover:text-[rgb(var(--text))] transition-colors">Privacy</Link>
            <Link to="/app/profile" className="hover:text-[rgb(var(--text))] transition-colors">Settings</Link>
          </nav>
        </div>
        <p className="mt-7 max-w-3xl text-[12.5px] leading-relaxed text-muted">
          Dusk is intended for consenting adults aged 18 and over. Content is romantic and playful, never
          graphic. Nothing here is therapy, medical advice, or a validated compatibility assessment — it is a
          conversation starter. Never pressure a partner into an activity, and skip anything that does not
          feel right for both of you.
        </p>
        <p className="mt-4 text-[12.5px] text-muted">© {new Date().getFullYear()} Dusk. Made for two.</p>
      </footer>
    </div>
  )
}

/* ------------------------------------------------------------- helpers */

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto w-[min(1180px,94vw)] scroll-mt-24 py-16 sm:py-24">
      {children}
    </section>
  )
}

function StepCard({ n, title, body, icon: Icon, index }: { n: string; title: string; body: string; icon: typeof Heart; index: number }) {
  const reduced = useReducedMotion()
  return (
    <div className="relative h-full overflow-hidden rounded-[28px] glass p-7">
      <div className="text-[46px] font-bold leading-none text-white/[0.08]">{n}</div>
      <motion.span
        aria-hidden
        className="mt-3 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(255,107,139,.22), rgba(124,83,232,.22))' }}
        animate={reduced ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
      >
        <Icon size={21} className="text-rose-200" />
      </motion.span>
      <h3 className="mt-4 text-[18px] font-semibold">{title}</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body}</p>
    </div>
  )
}

function HeroCards() {
  const reduced = useReducedMotion()
  const cards = [
    { title: 'Midnight Walk', meta: '🌙 Romantic · 40 min · Free', rotate: -9, offset: -1, y: 30, scale: 0.94, delay: 0.5 },
    { title: 'Two-Person Playlist Battle', meta: '🎲 Playful · 30 min · Free', rotate: 0, offset: 0, y: 0, scale: 1, delay: 0.62, front: true },
    { title: 'Explore a New Neighbourhood', meta: '✨ Adventure · 2 hr · Low', rotate: 9, offset: 1, y: 30, scale: 0.94, delay: 0.74 },
  ]
  return (
    // overflow-hidden: the fanned side cards intentionally sit outside the
    // container. Without clipping they widen the *layout viewport* on narrow
    // phones, which stretches every `fixed inset-0` overlay (age gate, sheets)
    // past the screen edge.
    <div className="relative mt-14 h-[300px] w-full max-w-4xl overflow-hidden sm:h-[280px]">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 60, rotate: 0, x: '-50%' }}
          animate={{
            opacity: 1,
            y: reduced ? 0 : c.y,
            rotate: reduced ? 0 : c.rotate,
            scale: c.scale,
            x: `calc(-50% + ${c.offset * (reduced ? 0 : 1)}px)`,
          }}
          transition={{ duration: 0.9, delay: c.delay, ease }}
          whileHover={reduced ? {} : { y: c.y - 16, rotate: 0, scale: 1, zIndex: 20, transition: { duration: 0.4, ease } }}
          className="absolute left-1/2 top-0 w-[250px] rounded-[26px] glass-strong p-5 text-left shadow-2xl sm:w-[280px]"
          style={{
            zIndex: c.front ? 10 : i,
            // fan out with a responsive gap so the three cards never collide
            marginLeft: `calc(${c.offset} * min(19vw, 300px))`,
          }}
        >
          <div className="text-[11.5px] uppercase tracking-[0.14em] text-muted">Tonight's challenge</div>
          <div className="mt-2.5 text-[19px] font-semibold leading-tight">{c.title}</div>
          <div className="mt-3 text-[13px] text-muted">{c.meta}</div>
          <div className="mt-4 flex gap-2">
            <span className="chip">Start</span>
            <span className="chip">Skip</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function WheelPreview() {
  const reduced = useReducedMotion()
  const [hover, setHover] = useState(false)
  const size = 320
  const R = size / 2
  const slice = 360 / CATEGORIES.length

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div aria-hidden className="absolute inset-[-12%] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(224,67,106,.32), rgba(124,83,232,.2) 55%, transparent 72%)' }} />
      <motion.svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="relative drop-shadow-2xl"
        animate={reduced ? {} : { rotate: hover ? 360 : 0 }}
        transition={{ duration: hover ? 8 : 1.2, ease: hover ? 'linear' : ease, repeat: hover ? Infinity : 0 }}
        role="img"
        aria-label="Preview of the category wheel"
      >
        <defs>
          {CATEGORIES.map((c, i) => (
            <linearGradient key={c.id} id={`lp-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.from} />
              <stop offset="100%" stopColor={c.to} />
            </linearGradient>
          ))}
        </defs>
        {CATEGORIES.map((c, i) => {
          const a0 = ((i * slice - 90) * Math.PI) / 180
          const a1 = (((i + 1) * slice - 90) * Math.PI) / 180
          const mid = (i + 0.5) * slice - 90
          const lx = R + R * 0.66 * Math.cos((mid * Math.PI) / 180)
          const ly = R + R * 0.66 * Math.sin((mid * Math.PI) / 180)
          return (
            <g key={c.id}>
              <path
                d={`M ${R} ${R} L ${R + R * Math.cos(a0)} ${R + R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${R + R * Math.cos(a1)} ${R + R * Math.sin(a1)} Z`}
                fill={`url(#lp-${i})`}
                stroke="rgba(255,255,255,.14)"
                strokeWidth="1.5"
              />
              <text x={lx} y={ly} textAnchor="middle" fontSize="17" dy="6">{c.emoji}</text>
            </g>
          )
        })}
        <circle cx={R} cy={R} r={R - 1} fill="none" stroke="rgba(255,255,255,.26)" strokeWidth="2" />
      </motion.svg>
      <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full glass-strong">
        <span className="text-[12px] font-bold uppercase tracking-[0.14em]">Spin</span>
      </div>
      <div className="absolute left-1/2 top-[-6px] h-6 w-6 -translate-x-1/2 rotate-45 rounded-[7px] border border-white/25 bg-white shadow-lg" />
    </div>
  )
}
