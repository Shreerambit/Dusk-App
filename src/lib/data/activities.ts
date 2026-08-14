import type { Activity, CategoryId } from '@/lib/types'
import { parseRows } from './schema'
import { ROMANCE, CONVERSATION, GAMES } from './rows-a'
import { DATENIGHT, ADVENTURE, KNOW } from './rows-b'
import { AFFECTION, CHEMISTRY, EXPLORE } from './rows-c'

/**
 * To add content later: append a row to the relevant array in rows-*.ts,
 * or register a whole new category here plus an entry in CATEGORIES.
 */
const SOURCES: Array<[CategoryId, string[]]> = [
  ['romance', ROMANCE],
  ['conversation', CONVERSATION],
  ['games', GAMES],
  ['datenight', DATENIGHT],
  ['adventure', ADVENTURE],
  ['know', KNOW],
  ['affection', AFFECTION],
  ['chemistry', CHEMISTRY],
  ['explore', EXPLORE],
]

export const ACTIVITIES: Activity[] = SOURCES.flatMap(([cat, rows]) => parseRows(cat, rows))

export const ACTIVITY_BY_ID = new Map(ACTIVITIES.map((a) => [a.id, a]))

export const BY_CATEGORY = ACTIVITIES.reduce<Record<string, Activity[]>>((acc, a) => {
  ;(acc[a.category] ||= []).push(a)
  return acc
}, {})

export function getActivity(id: string): Activity | undefined {
  return ACTIVITY_BY_ID.get(id)
}
