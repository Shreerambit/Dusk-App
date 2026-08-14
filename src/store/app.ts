import { create } from 'zustand'
import type { Activity, Comfort, CoupleProfile, HistoryEntry, Preferences, SavedItem } from '@/lib/types'
import { repository, DEFAULT_DATA, type AppData } from '@/lib/repository'
import { computeStreak, signalsFromHistory, type TasteSignals } from '@/lib/engine'
import { BADGES } from '@/lib/data/quiz'

interface AppState extends AppData {
  hydrated: boolean
  locked: boolean
  toast: { id: number; message: string } | null

  hydrate: () => Promise<void>
  persist: () => void

  verifyAge: () => void
  setPrefs: (patch: Partial<Preferences>) => void
  setComfort: (c: Comfort) => void
  setProfile: (p: CoupleProfile | null) => void
  lock: () => void
  unlock: () => void

  toggleFavorite: (item: Omit<SavedItem, 'id' | 'savedAt'>) => boolean
  isFavorite: (key: string) => boolean
  removeFavorite: (id: string) => void

  complete: (activity: Activity, extra?: Partial<HistoryEntry>) => string
  rateHistory: (id: string, patch: Partial<HistoryEntry>) => void
  removeHistory: (id: string) => void
  skip: (activityId: string) => void
  registerSpin: () => void

  clearHistory: () => void
  clearFavorites: () => void
  clearAll: () => void
  exportData: () => string

  signals: () => TasteSignals
  streak: () => number
  badges: () => Array<{ id: string; label: string; desc: string; earned: boolean }>
  level: () => { level: number; label: string; progress: number; next: number }
  notify: (message: string) => void
}

const LEVELS = ['Just Met', 'Getting Warm', 'In Sync', 'Well Matched', 'Inseparable', 'Legendary']

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export const useApp = create<AppState>((set, get) => ({
  ...structuredClone(DEFAULT_DATA),
  hydrated: false,
  locked: false,
  toast: null,

  hydrate: async () => {
    const data = await repository.load()
    set({ ...data, hydrated: true, locked: data.preferences.privateMode })
  },

  persist: () => {
    const s = get()
    void repository.save({
      version: s.version,
      ageVerified: s.ageVerified,
      preferences: s.preferences,
      profile: s.profile,
      favorites: s.favorites,
      history: s.history,
      skipped: s.skipped,
      stats: s.stats,
      session: s.session,
    })
  },

  verifyAge: () => { set({ ageVerified: true }); get().persist() },

  setPrefs: (patch) => {
    set((s) => ({ preferences: { ...s.preferences, ...patch } }))
    if (patch.privateMode === false) set({ locked: false })
    get().persist()
  },

  setComfort: (comfort) => { get().setPrefs({ comfort }) },

  setProfile: (profile) => { set({ profile }); get().persist() },

  lock: () => { if (get().preferences.privateMode) set({ locked: true }) },
  unlock: () => set({ locked: false }),

  toggleFavorite: (item) => {
    const key = item.activityId ?? item.title
    const existing = get().favorites.find((f) => (f.activityId ?? f.title) === key)
    if (existing) {
      set((s) => ({ favorites: s.favorites.filter((f) => f.id !== existing.id) }))
      get().persist()
      get().notify('Removed from Saved')
      return false
    }
    const saved: SavedItem = { ...item, id: uid('fav'), savedAt: Date.now() }
    set((s) => ({ favorites: [saved, ...s.favorites] }))
    get().persist()
    get().notify('Saved for later')
    return true
  },

  isFavorite: (key) => get().favorites.some((f) => (f.activityId ?? f.title) === key),

  removeFavorite: (id) => {
    set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) }))
    get().persist()
  },

  complete: (activity, extra) => {
    const entry: HistoryEntry = {
      id: uid('h'),
      activityId: activity.id,
      title: activity.title,
      category: activity.category,
      completedAt: Date.now(),
      ...extra,
    }
    set((s) => ({
      history: [entry, ...s.history].slice(0, 500),
      stats: { ...s.stats, completed: s.stats.completed + 1, points: s.stats.points + 10 },
    }))
    get().persist()
    return entry.id
  },

  rateHistory: (id, patch) => {
    set((s) => ({
      history: s.history.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      stats: { ...s.stats, points: s.stats.points + (patch.rating ? 5 : 0) },
    }))
    get().persist()
  },

  removeHistory: (id) => {
    set((s) => ({ history: s.history.filter((h) => h.id !== id) }))
    get().persist()
  },

  skip: (activityId) => {
    set((s) => ({ skipped: [activityId, ...s.skipped].slice(0, 80) }))
    get().persist()
  },

  registerSpin: () => {
    set((s) => ({ stats: { ...s.stats, spins: s.stats.spins + 1, points: s.stats.points + 2 } }))
    get().persist()
  },

  clearHistory: () => { set({ history: [] }); get().persist(); get().notify('History deleted') },
  clearFavorites: () => { set({ favorites: [] }); get().persist(); get().notify('Saved items deleted') },

  clearAll: () => {
    void repository.clear()
    set({ ...structuredClone(DEFAULT_DATA), ageVerified: true, hydrated: true, locked: false })
    get().persist()
    get().notify('All local data cleared')
  },

  exportData: () => {
    const s = get()
    return repository.export({
      version: s.version,
      ageVerified: s.ageVerified,
      preferences: s.preferences,
      profile: s.profile,
      favorites: s.favorites,
      history: s.history,
      skipped: s.skipped,
      stats: s.stats,
      session: s.session,
    })
  },

  signals: () => {
    const s = get()
    return signalsFromHistory(s.history, s.favorites.map((f) => f.activityId ?? ''), s.skipped)
  },

  streak: () => (get().preferences.streakPaused ? 0 : computeStreak(get().history)),

  badges: () => {
    const s = get()
    const stat = {
      completed: s.stats.completed,
      games: s.history.filter((h) => h.category === 'games').length,
      adventures: s.history.filter((h) => h.category === 'adventure' || h.category === 'explore').length,
      streak: computeStreak(s.history),
      categories: new Set(s.history.map((h) => h.category)).size,
      notes: s.history.filter((h) => h.note && h.note.trim().length > 0).length,
      saved: s.favorites.length,
      spins: s.stats.spins,
    }
    return BADGES.map((b) => ({
      id: b.id,
      label: b.label,
      desc: b.desc,
      earned: (b.check as (x: typeof stat) => boolean)(stat),
    }))
  },

  level: () => {
    const points = get().stats.points
    const step = 120
    const idx = Math.min(LEVELS.length - 1, Math.floor(points / step))
    const within = points - idx * step
    return {
      level: idx + 1,
      label: LEVELS[idx],
      progress: idx === LEVELS.length - 1 ? 1 : within / step,
      next: idx === LEVELS.length - 1 ? points : (idx + 1) * step,
    }
  },

  notify: (message) => {
    const id = Date.now()
    set({ toast: { id, message } })
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 2400)
  },
}))
