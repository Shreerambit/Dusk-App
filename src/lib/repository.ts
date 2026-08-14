/**
 * Persistence boundary.
 *
 * Everything the app stores goes through this interface. The default
 * implementation is local-storage only (nothing leaves the device).
 * A Supabase/Firebase adapter can implement the same interface later —
 * table names mirror the key names below:
 *   users · couples · activities · categories · favorites · history · ratings · sessions
 */

import type { CoupleProfile, HistoryEntry, Preferences, SavedItem } from '@/lib/types'

export interface AppData {
  version: number
  ageVerified: boolean
  preferences: Preferences
  profile: CoupleProfile | null
  favorites: SavedItem[]
  history: HistoryEntry[]
  skipped: string[]
  stats: { spins: number; points: number; completed: number }
  streakFreezeAt?: number
  session?: { code: string; createdAt: number } | null
}

export const DEFAULT_PREFS: Preferences = {
  theme: 'dark',
  sound: false,
  reducedMotion: false,
  largeText: false,
  highContrast: false,
  privateMode: false,
  autoLockMinutes: 5,
  notificationsEnabled: false,
  comfort: 'playful',
  streakPaused: false,
  gamification: true,
}

export const DEFAULT_DATA: AppData = {
  version: 1,
  ageVerified: false,
  preferences: DEFAULT_PREFS,
  profile: null,
  favorites: [],
  history: [],
  skipped: [],
  stats: { spins: 0, points: 0, completed: 0 },
  session: null,
}

export interface Repository {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
  clear(): Promise<void>
  export(data: AppData): string
}

const KEY = 'dusk.app.v1'

export class LocalRepository implements Repository {
  async load(): Promise<AppData> {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return structuredClone(DEFAULT_DATA)
      const parsed = JSON.parse(raw) as Partial<AppData>
      return {
        ...structuredClone(DEFAULT_DATA),
        ...parsed,
        preferences: { ...DEFAULT_PREFS, ...(parsed.preferences ?? {}) },
        stats: { ...DEFAULT_DATA.stats, ...(parsed.stats ?? {}) },
      }
    } catch {
      return structuredClone(DEFAULT_DATA)
    }
  }

  async save(data: AppData): Promise<void> {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* quota or private browsing — the app keeps working in memory */
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(KEY)
  }

  export(data: AppData): string {
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), app: 'Dusk', ...data },
      null,
      2,
    )
  }
}

/**
 * Future: implement RemoteRepository with the same shape.
 *
 * class SupabaseRepository implements Repository {
 *   constructor(private client: SupabaseClient, private coupleId: string) {}
 *   async load() { ...select from couples/history/favorites... }
 *   async save(data) { ...upsert... }
 * }
 *
 * Nothing in the UI imports a concrete class directly — see src/store/app.ts.
 */
export const repository: Repository = new LocalRepository()
