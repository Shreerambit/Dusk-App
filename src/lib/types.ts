/**
 * Core domain types.
 *
 * These shapes intentionally mirror a future relational schema
 * (users, couples, activities, categories, favorites, history, ratings, sessions)
 * so the local-storage repository can be swapped for Supabase/Firebase
 * without touching UI code. See src/lib/repository.ts.
 */

export type CategoryId =
  | 'romance'
  | 'conversation'
  | 'games'
  | 'datenight'
  | 'adventure'
  | 'know'
  | 'affection'
  | 'chemistry'
  | 'explore'

export type Difficulty = 'easy' | 'medium' | 'bold'
export type Cost = 'free' | 'low' | 'medium' | 'premium'
export type LocationKind = 'home' | 'outdoors' | 'venue' | 'anywhere' | 'distance'
export type Mood =
  | 'romantic'
  | 'funny'
  | 'relaxing'
  | 'adventurous'
  | 'spontaneous'
  | 'cozy'
  | 'creative'

/** Comfort level gates how bold an activity can be. */
export type Comfort = 'relaxed' | 'playful' | 'romantic' | 'adventurous'

export type ExploreTag =
  | 'Romantic'
  | 'Funny'
  | 'Adventurous'
  | 'Relaxing'
  | 'Creative'
  | 'Food'
  | 'Travel'
  | 'Games'
  | 'Conversation'
  | 'Memories'
  | 'Fitness'
  | 'Movies'
  | 'Music'
  | 'Photography'
  | 'DIY'
  | 'Learning'
  | 'Outdoor'
  | 'Indoor'

export interface Activity {
  id: string
  title: string
  category: CategoryId
  difficulty: Difficulty
  /** Minutes. Used for both display and time-budget filtering. */
  duration: number
  location: LocationKind
  cost: Cost
  mood: Mood
  participants: number
  tags: ExploreTag[]
  description: string
}

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  blurb: string
  /** Two-stop gradient used across wheel, chips and cards. */
  from: string
  to: string
  /** Minimum comfort level required to surface this category. */
  minComfort: Comfort
}

export interface HistoryEntry {
  id: string
  activityId: string
  /** Snapshot so history survives content updates. */
  title: string
  category: CategoryId
  completedAt: number
  rating?: 1 | 2 | 3 | 4 | 5
  reaction?: 'loved' | 'good' | 'okay' | 'different'
  note?: string
}

export interface SavedItem {
  id: string
  kind: 'activity' | 'date' | 'question' | 'challenge' | 'game'
  activityId?: string
  title: string
  subtitle?: string
  payload?: unknown
  savedAt: number
}

export interface CoupleProfile {
  nickname: string
  favoriteMoods: Mood[]
  favoriteLocations: LocationKind[]
  preferredBudget: Cost | 'any'
  favoriteDateStyle: string
  createdAt: number
}

export interface Preferences {
  theme: 'dark' | 'light'
  sound: boolean
  reducedMotion: boolean
  largeText: boolean
  highContrast: boolean
  privateMode: boolean
  /** Minutes of inactivity before Private Mode re-locks. 0 = never. */
  autoLockMinutes: number
  notificationsEnabled: boolean
  comfort: Comfort
  streakPaused: boolean
  gamification: boolean
}

export interface DatePlanStep {
  label: string
  activity: Activity
}

export interface DatePlan {
  id: string
  title: string
  createdAt: number
  steps: DatePlanStep[]
  budget: Cost | 'any'
  totalMinutes: number
}

export interface QuizQuestion {
  id: string
  prompt: string
  topic: 'compatibility' | 'interests' | 'differences' | 'memories' | 'goals'
  options: string[]
}

export interface WhoQuestion {
  id: string
  prompt: string
}
