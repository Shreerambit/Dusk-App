import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { Activity, CategoryId, Cost, ExploreTag, LocationKind } from '@/lib/types'
import { Button, GlassCard, SegmentedControl, Sheet } from '@/components/ui'
import { ActivityCard } from '@/components/ActivityCard'
import { RatingSheet } from '@/components/RatingSheet'
import { useApp } from '@/store/app'
import { CATEGORIES, EXPLORE_TAGS } from '@/lib/data/schema'
import { ACTIVITIES } from '@/lib/data/activities'
import { comfortAllows, shuffle } from '@/lib/engine'
import { useFeedback } from '@/hooks/useHaptics'
import { ease } from '@/hooks/useMotionPrefs'

const PAGE = 12

export default function Explore() {
  const comfort = useApp((s) => s.preferences.comfort)
  const feedback = useFeedback()

  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<ExploreTag[]>([])
  const [cats, setCats] = useState<CategoryId[]>([])
  const [budget, setBudget] = useState<Cost | 'any'>('any')
  const [location, setLocation] = useState<LocationKind | 'anywhere'>('anywhere')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [count, setCount] = useState(PAGE)
  const [rating, setRating] = useState<Activity | null>(null)
  const [seed, setSeed] = useState(0)

  const sentinel = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = ACTIVITIES.filter((a) => {
      if (!comfortAllows(comfort, a.category)) return false
      if (cats.length && !cats.includes(a.category)) return false
      if (tags.length && !tags.some((t) => a.tags.includes(t))) return false
      if (budget !== 'any' && a.cost !== budget) return false
      if (location !== 'anywhere' && a.location !== location) return false
      if (q && !(`${a.title} ${a.description} ${a.tags.join(' ')}`.toLowerCase().includes(q))) return false
      return true
    })
    return seed ? shuffle(list) : list
  }, [query, tags, cats, budget, location, comfort, seed])

  useEffect(() => { setCount(PAGE) }, [query, tags, cats, budget, location])

  // Infinite scroll
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setCount((c) => (c < results.length ? c + PAGE : c))
      },
      { rootMargin: '400px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [results.length])

  const toggleTag = useCallback((t: ExploreTag) => {
    feedback('tap')
    setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
  }, [feedback])

  const activeFilters = tags.length + cats.length + (budget !== 'any' ? 1 : 0) + (location !== 'anywhere' ? 1 : 0)

  function clearAll() {
    setTags([]); setCats([]); setBudget('any'); setLocation('anywhere'); setQuery('')
  }

  return (
    <div className="pb-6">
      <header className="mb-6">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Explore</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          {ACTIVITIES.length} ideas across every category. Keep scrolling — there is always another one.
        </p>
      </header>

      {/* search + filter bar */}
      <div className="sticky top-2 z-30 mb-5 rounded-[22px] glass-strong p-2.5 md:top-24">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ideas…"
              aria-label="Search activities"
              className="h-11 w-full rounded-2xl bg-white/[0.06] pl-10 pr-3 text-[14.5px] placeholder:text-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
            />
          </div>
          <Button
            icon={<SlidersHorizontal size={15} />}
            onClick={() => setFiltersOpen(true)}
            className="relative shrink-0"
          >
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </Button>
          <Button onClick={() => { feedback('tap'); setSeed((s) => s + 1) }} className="shrink-0">Shuffle</Button>
        </div>

        <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
          {EXPLORE_TAGS.map((t) => {
            const active = tags.includes(t)
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                aria-pressed={active}
                className={`chip shrink-0 transition-all duration-300 ${
                  active ? 'border-transparent bg-gradient-to-r from-rose-500 to-purple-500 text-white' : 'hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {activeFilters > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 text-[13.5px] text-muted">
          <span>{results.length} {results.length === 1 ? 'idea' : 'ideas'}</span>
          <button onClick={clearAll} className="flex items-center gap-1.5 font-medium text-rose-300 hover:underline">
            <X size={13} /> Clear filters
          </button>
        </div>
      )}

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.slice(0, count).map((a, i) => (
            <ActivityCard key={a.id} activity={a} index={i % PAGE} onClick={() => setRating(a)} />
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-[28px] glass p-10 text-center"
        >
          <h3 className="text-[18px] font-semibold">Nothing matches that</h3>
          <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">
            Try removing a filter or lowering the specificity of your search.
          </p>
          <Button className="mt-5" onClick={clearAll}>Clear filters</Button>
        </motion.div>
      )}

      <div ref={sentinel} className="h-16" />

      {count < results.length && (
        <div className="flex justify-center pb-4">
          <Button size="lg" onClick={() => setCount((c) => c + PAGE)}>Load more</Button>
        </div>
      )}

      {/* filters sheet */}
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="space-y-6">
          <div>
            <div className="mb-2.5 text-[13px] font-medium text-muted">Categories</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => comfortAllows(comfort, c.id)).map((c) => {
                const active = cats.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => { feedback('tap'); setCats((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id])) }}
                    aria-pressed={active}
                    className="chip transition-all duration-300"
                    style={active ? { background: `linear-gradient(135deg, ${c.from}, ${c.to})`, borderColor: 'transparent', color: '#fff' } : undefined}
                  >
                    <span aria-hidden>{c.emoji}</span> {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          <SegmentedControl
            label="Budget"
            options={[
              { value: 'any', label: 'Any' }, { value: 'free', label: 'Free' },
              { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'premium', label: 'Premium' },
            ]}
            value={budget}
            onChange={setBudget}
            columns={3}
          />

          <SegmentedControl
            label="Location"
            options={[
              { value: 'anywhere', label: 'Anywhere' }, { value: 'home', label: 'Home' },
              { value: 'outdoors', label: 'Outdoors' }, { value: 'venue', label: 'Out' }, { value: 'distance', label: 'Long-distance' },
            ]}
            value={location}
            onChange={setLocation}
            columns={3}
          />
        </div>

        <div className="mt-7 flex gap-2.5">
          <Button size="lg" className="flex-1" onClick={clearAll}>Clear all</Button>
          <Button variant="primary" size="lg" className="flex-1" onClick={() => setFiltersOpen(false)}>
            Show {results.length}
          </Button>
        </div>
      </Sheet>

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} />
    </div>
  )
}

/** Small helper used by empty states elsewhere. */
export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <GlassCard className="flex min-h-[260px] flex-col items-center justify-center p-10 text-center">
        <h3 className="text-[19px] font-semibold">{title}</h3>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-muted">{body}</p>
        {action && <div className="mt-5">{action}</div>}
      </GlassCard>
    </motion.div>
  )
}
