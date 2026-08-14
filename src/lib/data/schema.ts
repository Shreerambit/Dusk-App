import type { Activity, Category, CategoryId, Cost, Difficulty, ExploreTag, LocationKind, Mood } from '@/lib/types'

/**
 * Activities are authored as compact pipe-delimited rows so that hundreds of
 * entries stay readable and new content can be appended in one line.
 *
 * ROW FORMAT
 * title | difficulty | minutes | location | cost | mood | tags(comma) | description
 *
 * difficulty: e = easy, m = medium, b = bold
 * location:   h = home, o = outdoors, v = venue, a = anywhere, d = long-distance
 * cost:       f = free, l = low, m = medium, p = premium
 * mood:       ro = romantic, fu = funny, re = relaxing, ad = adventurous,
 *             sp = spontaneous, co = cozy, cr = creative
 */

const DIFF: Record<string, Difficulty> = { e: 'easy', m: 'medium', b: 'bold' }
const LOC: Record<string, LocationKind> = { h: 'home', o: 'outdoors', v: 'venue', a: 'anywhere', d: 'distance' }
const COST: Record<string, Cost> = { f: 'free', l: 'low', m: 'medium', p: 'premium' }
const MOOD: Record<string, Mood> = {
  ro: 'romantic', fu: 'funny', re: 'relaxing', ad: 'adventurous', sp: 'spontaneous', co: 'cozy', cr: 'creative',
}

function slug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
}

export function parseRows(category: CategoryId, rows: string[]): Activity[] {
  return rows.map((row) => {
    const [title, d, mins, loc, cost, mood, tags, description] = row.split('|').map((s) => s.trim())
    const activity: Activity = {
      id: `${category}-${slug(title)}`,
      title,
      category,
      difficulty: DIFF[d] ?? 'easy',
      duration: Number(mins) || 20,
      location: LOC[loc] ?? 'anywhere',
      cost: COST[cost] ?? 'free',
      mood: MOOD[mood] ?? 'romantic',
      participants: 2,
      tags: tags ? (tags.split(',').map((t) => t.trim()) as ExploreTag[]) : [],
      description: description ?? '',
    }
    return activity
  })
}

export const CATEGORIES: Category[] = [
  { id: 'romance', label: 'Romance', emoji: '❤️', blurb: 'Warm, heartfelt moments together.', from: '#ff6b8b', to: '#e0436a', minComfort: 'relaxed' },
  { id: 'conversation', label: 'Conversation', emoji: '💬', blurb: 'Questions that go somewhere real.', from: '#7dd3fc', to: '#4f79e8', minComfort: 'relaxed' },
  { id: 'games', label: 'Couple Games', emoji: '🎲', blurb: 'Playful two-person games.', from: '#fbbf6b', to: '#f0803c', minComfort: 'relaxed' },
  { id: 'datenight', label: 'Date Night', emoji: '🌙', blurb: 'At-home and out-of-house dates.', from: '#b79cff', to: '#7c53e8', minComfort: 'relaxed' },
  { id: 'adventure', label: 'Adventure', emoji: '✨', blurb: 'Unexpected things to try.', from: '#5eead4', to: '#0f9b8e', minComfort: 'relaxed' },
  { id: 'know', label: 'Know Each Other', emoji: '🧠', blurb: 'Preferences, memories and goals.', from: '#a5b4fc', to: '#6366f1', minComfort: 'relaxed' },
  { id: 'affection', label: 'Affection', emoji: '💕', blurb: 'Gentle, non-explicit closeness.', from: '#ffa8c5', to: '#f0699a', minComfort: 'playful' },
  { id: 'chemistry', label: 'Chemistry', emoji: '🔥', blurb: 'Flirty, playful, never graphic.', from: '#ff9a76', to: '#ef4f5f', minComfort: 'romantic' },
  { id: 'explore', label: 'Explore', emoji: '🌎', blurb: 'New places and experiences.', from: '#93c5fd', to: '#2563eb', minComfort: 'relaxed' },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>

export const COMFORT_ORDER = ['relaxed', 'playful', 'romantic', 'adventurous'] as const

export const EXPLORE_TAGS: ExploreTag[] = [
  'Romantic', 'Funny', 'Adventurous', 'Relaxing', 'Creative', 'Food', 'Travel', 'Games',
  'Conversation', 'Memories', 'Fitness', 'Movies', 'Music', 'Photography', 'DIY', 'Learning', 'Outdoor', 'Indoor',
]

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', bold: 'Bold' }
export const COST_LABEL: Record<Cost, string> = { free: 'Free', low: '$', medium: '$$', premium: '$$$' }
export const LOCATION_LABEL: Record<LocationKind, string> = {
  home: 'Indoor', outdoors: 'Outdoor', venue: 'Out & about', anywhere: 'Anywhere', distance: 'Long-distance',
}
export const MOOD_LABEL: Record<Mood, string> = {
  romantic: 'Romantic', funny: 'Funny', relaxing: 'Relaxing', adventurous: 'Adventurous',
  spontaneous: 'Spontaneous', cozy: 'Cozy', creative: 'Creative',
}

export function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`
  if (mins % 60 === 0) return `${mins / 60} hr`
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`
}
