import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { NotebookPen, Star, Trash2 } from 'lucide-react'
import type { HistoryEntry } from '@/lib/types'
import { Button, GlassCard, Sheet } from '@/components/ui'
import { CategoryBadge } from '@/components/ActivityCard'
import { EmptyState } from '@/pages/Explore'
import { useApp } from '@/store/app'
import { spring, ease } from '@/hooks/useMotionPrefs'

const REACTION_EMOJI: Record<string, string> = { loved: '❤️', good: '🙂', okay: '😐', different: '🔄' }

function bucketOf(ts: number): string {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 7)
  const monthAgo = new Date(); monthAgo.setMonth(today.getMonth() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  if (d >= weekAgo) return 'Last week'
  if (d >= monthAgo) return 'Last month'
  return 'Earlier'
}

export default function Journey() {
  const history = useApp((s) => s.history)
  const removeHistory = useApp((s) => s.removeHistory)
  const clearHistory = useApp((s) => s.clearHistory)
  const rateHistory = useApp((s) => s.rateHistory)
  const privateMode = useApp((s) => s.preferences.privateMode)
  const [editing, setEditing] = useState<HistoryEntry | null>(null)
  const [note, setNote] = useState('')

  const grouped = useMemo(() => {
    const order = ['Today', 'Yesterday', 'Last week', 'Last month', 'Earlier']
    const map = new Map<string, HistoryEntry[]>()
    for (const h of [...history].sort((a, b) => b.completedAt - a.completedAt)) {
      const b = bucketOf(h.completedAt)
      if (!map.has(b)) map.set(b, [])
      map.get(b)!.push(h)
    }
    return order.filter((o) => map.has(o)).map((o) => [o, map.get(o)!] as const)
  }, [history])

  const stats = useMemo(() => {
    const rated = history.filter((h) => h.rating)
    const avg = rated.length ? rated.reduce((a, h) => a + (h.rating ?? 0), 0) / rated.length : 0
    const cats = new Map<string, number>()
    history.forEach((h) => cats.set(h.category, (cats.get(h.category) ?? 0) + 1))
    const top = [...cats.entries()].sort((a, b) => b[1] - a[1])[0]
    return { total: history.length, avg, top: top?.[0], topCount: top?.[1] ?? 0 }
  }, [history])

  return (
    <div className="pb-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(30px,6.5vw,48px)]">Our journey</h1>
          <p className="mt-3 text-[15px] text-muted">Everything you have done together, kept on this device.</p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" icon={<Trash2 size={15} />} onClick={clearHistory}>Delete history</Button>
        )}
      </header>

      {privateMode && (
        <div className="mb-5 rounded-2xl bg-white/[0.05] p-4 text-[13px] leading-relaxed text-muted">
          Private Mode is on. This page blurs when the app locks itself.
        </div>
      )}

      {history.length === 0 ? (
        <EmptyState
          title="No memories yet"
          body="Finish an activity and rate it — it will appear here as a timeline you can look back on."
          action={<Link to="/app/spin" className="btn btn-primary h-11 px-6">Spin something</Link>}
        />
      ) : (
        <>
          <div className="mb-7 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Completed', value: String(stats.total) },
              { label: 'Average rating', value: stats.avg ? `${stats.avg.toFixed(1)} / 5` : '—' },
              { label: 'Most played', value: stats.top ? `${stats.top} · ${stats.topCount}` : '—' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease }}
              >
                <GlassCard className="p-5">
                  <div className="text-[12px] uppercase tracking-wide text-muted">{s.label}</div>
                  <div className="mt-1.5 text-[22px] font-semibold capitalize">{s.value}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="space-y-9">
            {grouped.map(([bucket, entries]) => (
              <section key={bucket}>
                <h2 className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted">{bucket}</h2>
                <div className="relative space-y-3 border-l hairline pl-5">
                  <AnimatePresence mode="popLayout">
                    {entries.map((h, i) => (
                      <motion.div
                        key={h.id}
                        layout
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ ...spring.snappy, delay: Math.min(i * 0.04, 0.3) }}
                        className="relative"
                      >
                        <span
                          aria-hidden
                          className="absolute -left-[26px] top-6 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-400 to-purple-400"
                        />
                        <GlassCard className="p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <CategoryBadge id={h.category} />
                            <div className="flex items-center gap-1.5">
                              {h.reaction && <span className="text-[17px]">{REACTION_EMOJI[h.reaction]}</span>}
                              {h.rating && (
                                <span className="chip gap-1">
                                  <Star size={11} className="fill-current text-amber-300" />
                                  {h.rating}
                                </span>
                              )}
                              <button
                                onClick={() => { setEditing(h); setNote(h.note ?? '') }}
                                aria-label="Edit note"
                                className="rounded-full p-2 text-muted transition-colors hover:bg-white/10 hover:text-[rgb(var(--text))]"
                              >
                                <NotebookPen size={14} />
                              </button>
                              <button
                                onClick={() => removeHistory(h.id)}
                                aria-label={`Delete ${h.title}`}
                                className="rounded-full p-2 text-muted transition-colors hover:bg-white/10 hover:text-rose-300"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <h3 className="mt-3 text-[17px] font-semibold leading-tight">{h.title}</h3>
                          <div className="mt-1.5 text-[12.5px] text-muted">
                            {new Date(h.completedAt).toLocaleString(undefined, {
                              weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </div>

                          {h.note && (
                            <p className="mt-3 rounded-2xl bg-white/[0.05] p-3.5 text-[13.5px] italic leading-relaxed text-muted">
                              “{h.note}”
                            </p>
                          )}
                        </GlassCard>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Private note">
        <p className="-mt-2 mb-4 text-[14px] text-muted">{editing?.title}</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          aria-label="Private note"
          placeholder="Something to remember about this…"
          className="w-full resize-none rounded-2xl glass p-4 text-[14.5px] placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
        />
        <div className="mt-5 flex gap-2.5">
          <Button size="lg" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => {
              if (editing) rateHistory(editing.id, { note: note.trim() || undefined })
              setEditing(null)
            }}
          >
            Save note
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
