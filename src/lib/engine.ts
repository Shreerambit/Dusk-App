import type {
  Activity, CategoryId, Comfort, Cost, DatePlan, HistoryEntry, LocationKind, Mood,
} from '@/lib/types'
import { ACTIVITIES, BY_CATEGORY } from '@/lib/data/activities'
import { CATEGORY_MAP, COMFORT_ORDER } from '@/lib/data/schema'

/* ------------------------------------------------------------------ *
 * Randomisation primitives
 * ------------------------------------------------------------------ */

export function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Deterministic per-day index so both partners see the same daily challenge. */
export function dayIndex(date = new Date()): number {
  const key = Number(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`)
  // xorshift-ish scramble so consecutive days are not adjacent items
  let x = key ^ 0x5f3a
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5
  return Math.abs(x)
}

/** Weighted pick. Weights must be positive; falls back to uniform. */
export function weightedPick<T>(items: T[], weight: (item: T) => number): T {
  const weights = items.map((i) => Math.max(0.0001, weight(i)))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

/* ------------------------------------------------------------------ *
 * Filtering
 * ------------------------------------------------------------------ */

export interface FilterOptions {
  categories?: CategoryId[]
  maxMinutes?: number
  minMinutes?: number
  budget?: Cost | 'any'
  location?: LocationKind | 'anywhere'
  moods?: Mood[]
  comfort?: Comfort
  excludeIds?: string[]
  tags?: string[]
}

const COST_RANK: Record<Cost, number> = { free: 0, low: 1, medium: 2, premium: 3 }

export function comfortAllows(comfort: Comfort, category: CategoryId): boolean {
  const need = CATEGORY_MAP[category].minComfort
  return COMFORT_ORDER.indexOf(comfort) >= COMFORT_ORDER.indexOf(need)
}

/** Comfort also caps difficulty: relaxed never sees "bold" prompts. */
function difficultyAllowed(comfort: Comfort, a: Activity) {
  if (a.difficulty === 'bold') return comfort === 'romantic' || comfort === 'adventurous'
  if (a.difficulty === 'medium') return comfort !== 'relaxed'
  return true
}

export function filterActivities(opts: FilterOptions, pool: Activity[] = ACTIVITIES): Activity[] {
  const exclude = new Set(opts.excludeIds ?? [])
  return pool.filter((a) => {
    if (exclude.has(a.id)) return false
    if (opts.categories?.length && !opts.categories.includes(a.category)) return false
    if (opts.comfort) {
      if (!comfortAllows(opts.comfort, a.category)) return false
      if (!difficultyAllowed(opts.comfort, a)) return false
    }
    if (opts.maxMinutes != null && a.duration > opts.maxMinutes) return false
    if (opts.minMinutes != null && a.duration < opts.minMinutes) return false
    if (opts.budget && opts.budget !== 'any' && COST_RANK[a.cost] > COST_RANK[opts.budget]) return false
    if (opts.location && opts.location !== 'anywhere' && a.location !== opts.location && a.location !== 'anywhere') return false
    if (opts.moods?.length && !opts.moods.includes(a.mood)) return false
    if (opts.tags?.length && !opts.tags.some((t) => a.tags.includes(t as never))) return false
    return true
  })
}

/** Relaxes constraints one at a time rather than returning nothing. */
export function filterWithFallback(opts: FilterOptions): Activity[] {
  const attempts: FilterOptions[] = [
    opts,
    { ...opts, moods: undefined },
    { ...opts, moods: undefined, location: 'anywhere' },
    { ...opts, moods: undefined, location: 'anywhere', budget: 'any' },
    { ...opts, moods: undefined, location: 'anywhere', budget: 'any', maxMinutes: undefined },
    { comfort: opts.comfort, excludeIds: opts.excludeIds },
    { comfort: opts.comfort },
  ]
  for (const attempt of attempts) {
    const res = filterActivities(attempt)
    if (res.length) return res
  }
  return ACTIVITIES
}

/* ------------------------------------------------------------------ *
 * Smart random: avoids repeats, varies category, honours taste
 * ------------------------------------------------------------------ */

export interface TasteSignals {
  /** Most recent first. */
  recentActivityIds: string[]
  recentCategories: CategoryId[]
  /** categoryId -> average rating (1..5). */
  categoryRatings: Partial<Record<CategoryId, number>>
  skippedIds: string[]
  favoriteIds: string[]
}

export const EMPTY_SIGNALS: TasteSignals = {
  recentActivityIds: [], recentCategories: [], categoryRatings: {}, skippedIds: [], favoriteIds: [],
}

/**
 * Scores a candidate. Higher is more likely.
 * - hard-avoids the last 12 seen items
 * - dampens categories used in the last 3 activities (variety)
 * - boosts categories rated well, dampens repeatedly skipped items
 */
export function scoreActivity(a: Activity, s: TasteSignals): number {
  let score = 1

  const recentIdx = s.recentActivityIds.indexOf(a.id)
  if (recentIdx > -1) score *= recentIdx < 12 ? 0.02 : 0.4

  const catRecency = s.recentCategories.slice(0, 3).filter((c) => c === a.category).length
  if (catRecency) score *= Math.pow(0.35, catRecency)

  const rating = s.categoryRatings[a.category]
  if (rating != null) score *= 0.55 + (rating / 5) * 1.1

  const skips = s.skippedIds.filter((id) => id === a.id).length
  if (skips) score *= Math.pow(0.45, skips)

  if (s.favoriteIds.includes(a.id)) score *= 0.6 // already saved; show something new

  return score
}

export function smartPick(opts: FilterOptions, signals: TasteSignals = EMPTY_SIGNALS): Activity {
  const pool = filterWithFallback(opts)
  return weightedPick(pool, (a) => scoreActivity(a, signals))
}

/** Picks the wheel's landing category, biased away from what was just played. */
export function smartCategory(available: CategoryId[], signals: TasteSignals): CategoryId {
  return weightedPick(available, (c) => {
    let w = 1
    const recent = signals.recentCategories.slice(0, 3)
    const idx = recent.indexOf(c)
    if (idx > -1) w *= [0.18, 0.35, 0.6][idx] ?? 1
    const r = signals.categoryRatings[c]
    if (r != null) w *= 0.6 + (r / 5)
    return w
  })
}

/* ------------------------------------------------------------------ *
 * Recommendations — "You might like"
 * ------------------------------------------------------------------ */

export function recommend(signals: TasteSignals, comfort: Comfort, count = 3): Activity[] {
  const pool = filterActivities({ comfort, excludeIds: signals.recentActivityIds.slice(0, 8) })
  const ranked = pool
    .map((a) => ({ a, s: scoreActivity(a, signals) * (0.75 + Math.random() * 0.5) }))
    .sort((x, y) => y.s - x.s)

  const out: Activity[] = []
  const usedCats = new Set<CategoryId>()
  for (const { a } of ranked) {
    if (out.length >= count) break
    if (usedCats.has(a.category) && out.length < count) continue
    usedCats.add(a.category)
    out.push(a)
  }
  for (const { a } of ranked) {
    if (out.length >= count) break
    if (!out.includes(a)) out.push(a)
  }
  return out
}

/* ------------------------------------------------------------------ *
 * Date plan generator
 * ------------------------------------------------------------------ */

export interface DateInputs {
  budget: Cost | 'any'
  location: LocationKind | 'anywhere'
  minutes: number
  mood: Mood | 'any'
}

const STEP_TEMPLATES: Array<{ label: string; cats: CategoryId[]; share: number }> = [
  { label: 'Start with', cats: ['affection', 'conversation', 'explore'], share: 0.15 },
  { label: 'Then', cats: ['games', 'conversation', 'know'], share: 0.3 },
  { label: 'Next', cats: ['datenight', 'adventure', 'explore'], share: 0.35 },
  { label: 'Finish with', cats: ['romance', 'affection', 'chemistry'], share: 0.2 },
]

export function generateDatePlan(inputs: DateInputs, comfort: Comfort, signals: TasteSignals): DatePlan {
  const stepCount = inputs.minutes <= 30 ? 2 : inputs.minutes <= 60 ? 3 : 4
  const templates = STEP_TEMPLATES.slice(0, stepCount === 2 ? 2 : stepCount === 3 ? 3 : 4)
  const used: string[] = []
  const steps = templates.map((t) => {
    const budgetMinutes = Math.max(10, Math.round(inputs.minutes * (t.share / templates.reduce((a, b) => a + b.share, 0))))
    const activity = smartPick(
      {
        categories: t.cats.filter((c) => comfortAllows(comfort, c)),
        maxMinutes: Math.max(20, Math.round(budgetMinutes * 1.7)),
        budget: inputs.budget,
        location: inputs.location,
        moods: inputs.mood === 'any' ? undefined : [inputs.mood],
        comfort,
        excludeIds: [...used, ...signals.recentActivityIds.slice(0, 6)],
      },
      signals,
    )
    used.push(activity.id)
    return { label: t.label, activity }
  })

  const titles = ['Tonight\'s Plan', 'Your Evening', 'The Plan', 'Made For Tonight']
  return {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
    title: randomOf(titles),
    createdAt: Date.now(),
    steps,
    budget: inputs.budget,
    totalMinutes: steps.reduce((sum, s) => sum + s.activity.duration, 0),
  }
}

/* ------------------------------------------------------------------ *
 * Weekend + surprise generators
 * ------------------------------------------------------------------ */

export interface WeekendInputs {
  budget: Cost | 'any'
  distance: 'home' | 'local' | 'roadtrip'
  indoor: 'indoor' | 'outdoor' | 'mixed'
  mood: Mood | 'any'
  weather: 'good' | 'bad' | 'unknown'
}

const SLOTS: Array<{ label: string; cats: CategoryId[]; max: number }> = [
  { label: 'Morning', cats: ['explore', 'adventure', 'affection'], max: 240 },
  { label: 'Afternoon', cats: ['adventure', 'explore', 'games'], max: 360 },
  { label: 'Evening', cats: ['datenight', 'romance', 'conversation'], max: 240 },
  { label: 'Night', cats: ['romance', 'affection', 'chemistry', 'games'], max: 180 },
]

export function generateWeekend(inputs: WeekendInputs, comfort: Comfort, signals: TasteSignals) {
  const location: LocationKind | 'anywhere' =
    inputs.weather === 'bad' || inputs.indoor === 'indoor'
      ? 'home'
      : inputs.indoor === 'outdoor'
        ? 'outdoors'
        : inputs.distance === 'home'
          ? 'home'
          : 'anywhere'

  const used: string[] = []
  const usedCategories: CategoryId[] = []
  // Two slots that both read as "the compliment one" make the day feel repetitive
  // even when the ids differ, so we also track the leading noun of each title.
  const usedThemes: string[] = []
  const themeOf = (title: string) =>
    title
      .toLowerCase()
      .replace(/^(the|a|an|your|our|one)\s+/, '')
      .split(/\s+/)[0]
      .replace(/[^a-z]/g, '')

  return SLOTS.map((slot) => {
    const base = {
      categories: slot.cats.filter((c) => comfortAllows(comfort, c)),
      maxMinutes: inputs.distance === 'roadtrip' ? 900 : slot.max,
      budget: inputs.budget,
      location: slot.label === 'Night' ? 'anywhere' : location,
      moods: inputs.mood === 'any' ? undefined : [inputs.mood],
      comfort,
      excludeIds: used,
    }

    // Try a few times for a slot that is thematically distinct from the ones
    // already chosen; fall back to whatever we have rather than failing.
    let activity = smartPick(base, signals)
    for (let attempt = 0; attempt < 6; attempt++) {
      const freshTheme = !usedThemes.includes(themeOf(activity.title))
      const freshCategory = !usedCategories.includes(activity.category)
      if (freshTheme && freshCategory) break
      const next = smartPick(base, signals)
      if (next.id === activity.id) continue
      const nextFresh =
        !usedThemes.includes(themeOf(next.title)) && !usedCategories.includes(next.category)
      // Keep the better of the two so a constrained pool still improves.
      if (nextFresh || (!freshTheme && !usedThemes.includes(themeOf(next.title)))) {
        activity = next
      }
    }

    used.push(activity.id)
    usedCategories.push(activity.category)
    usedThemes.push(themeOf(activity.title))
    return { label: slot.label, activity }
  })
}

export interface SurpriseInputs {
  minutes: number
  budget: Cost | 'any'
  location: LocationKind | 'anywhere'
}

export function generateSurprise(inputs: SurpriseInputs, comfort: Comfort, signals: TasteSignals): Activity[] {
  const count = inputs.minutes <= 30 ? 2 : 3
  const used: string[] = []
  const out: Activity[] = []
  for (let i = 0; i < count; i++) {
    const a = smartPick(
      {
        maxMinutes: Math.max(15, Math.round((inputs.minutes / count) * 1.8)),
        budget: inputs.budget,
        location: inputs.location,
        comfort,
        excludeIds: [...used, ...signals.recentActivityIds.slice(0, 5)],
      },
      signals,
    )
    used.push(a.id)
    out.push(a)
  }
  return out
}

/* ------------------------------------------------------------------ *
 * Signals derived from stored history
 * ------------------------------------------------------------------ */

export function signalsFromHistory(
  history: HistoryEntry[],
  favorites: string[],
  skipped: string[],
): TasteSignals {
  const sorted = history.slice().sort((a, b) => b.completedAt - a.completedAt)
  const ratingBuckets: Partial<Record<CategoryId, number[]>> = {}
  for (const h of sorted) {
    if (h.rating) (ratingBuckets[h.category] ||= []).push(h.rating)
  }
  const categoryRatings: Partial<Record<CategoryId, number>> = {}
  for (const [cat, list] of Object.entries(ratingBuckets)) {
    const arr = list as number[]
    categoryRatings[cat as CategoryId] = arr.reduce((a, b) => a + b, 0) / arr.length
  }
  return {
    recentActivityIds: sorted.map((h) => h.activityId).slice(0, 40),
    recentCategories: sorted.map((h) => h.category).slice(0, 12),
    categoryRatings,
    skippedIds: skipped.slice(0, 60),
    favoriteIds: favorites,
  }
}

/** Categories available at a comfort level, for the wheel. */
export function availableCategories(comfort: Comfort): CategoryId[] {
  return (Object.keys(BY_CATEGORY) as CategoryId[]).filter((c) => comfortAllows(comfort, c))
}

/** Streak length in days, counting back from today (or yesterday if today is empty). */
export function computeStreak(history: HistoryEntry[]): number {
  if (!history.length) return 0
  const days = new Set(history.map((h) => new Date(h.completedAt).toDateString()))
  let streak = 0
  const cursor = new Date()
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  while (days.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function sessionCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = (n: number) => Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return `${pick(2)}${Math.floor(10 + Math.random() * 89)}-${pick(2)}`
}
