import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { Activity, SavedItem } from '@/lib/types'
import { Button, GlassCard, SegmentedControl } from '@/components/ui'
import { ActivityCard } from '@/components/ActivityCard'
import { RatingSheet } from '@/components/RatingSheet'
import { EmptyState } from '@/pages/Explore'
import { useApp } from '@/store/app'
import { getActivity } from '@/lib/data/activities'
import { spring } from '@/hooks/useMotionPrefs'

type Filter = 'all' | SavedItem['kind']

export default function Saved() {
  const favorites = useApp((s) => s.favorites)
  const removeFavorite = useApp((s) => s.removeFavorite)
  const clearFavorites = useApp((s) => s.clearFavorites)
  const [filter, setFilter] = useState<Filter>('all')
  const [rating, setRating] = useState<Activity | null>(null)

  const items = useMemo(
    () => (filter === 'all' ? favorites : favorites.filter((f) => f.kind === filter)),
    [favorites, filter],
  )

  const kinds = useMemo(() => {
    const set = new Set(favorites.map((f) => f.kind))
    return ['all', ...Array.from(set)] as Filter[]
  }, [favorites])

  return (
    <div className="pb-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(30px,6.5vw,48px)]">Saved for later</h1>
          <p className="mt-3 text-[15px] text-muted">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} kept on this device.
          </p>
        </div>
        {favorites.length > 0 && (
          <Button variant="danger" icon={<Trash2 size={15} />} onClick={clearFavorites}>
            Clear all
          </Button>
        )}
      </header>

      {kinds.length > 2 && (
        <div className="mb-6">
          <SegmentedControl
            options={kinds.map((k) => ({ value: k, label: k === 'all' ? 'All' : k[0].toUpperCase() + k.slice(1) }))}
            value={filter}
            onChange={setFilter}
            columns={Math.min(kinds.length, 5)}
          />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Tap the bookmark on any idea, plan or challenge and it will wait for you here."
          action={<Link to="/app/explore" className="btn btn-primary h-11 px-6">Find something</Link>}
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              const activity = item.activityId ? getActivity(item.activityId) : undefined
              if (activity) {
                return (
                  <motion.div key={item.id} layout exit={{ opacity: 0, scale: 0.94 }} transition={spring.snappy}>
                    <ActivityCard activity={activity} index={i} onClick={() => setRating(activity)} />
                  </motion.div>
                )
              }
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={spring.snappy}
                >
                  <GlassCard className="h-full p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="chip capitalize">{item.kind}</span>
                      <button
                        onClick={() => removeFavorite(item.id)}
                        aria-label={`Remove ${item.title}`}
                        className="rounded-full p-2 text-muted transition-colors hover:bg-white/10 hover:text-rose-300"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h3 className="mt-3.5 text-[18px] font-semibold leading-tight">{item.title}</h3>
                    {item.subtitle && <p className="mt-1.5 text-[13.5px] text-muted">{item.subtitle}</p>}

                    {Array.isArray(item.payload) && (
                      <ol className="mt-4 space-y-1.5">
                        {(item.payload as Array<{ label: string; title: string }>).map((s, n) => (
                          <li key={n} className="flex gap-2.5 text-[13.5px] text-muted">
                            <span className="text-rose-300">{n + 1}.</span>
                            <span>{s.title}</span>
                          </li>
                        ))}
                      </ol>
                    )}

                    <div className="mt-4 text-[12px] text-muted">
                      Saved {new Date(item.savedAt).toLocaleDateString()}
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <RatingSheet activity={rating} open={!!rating} onClose={() => setRating(null)} />
    </div>
  )
}
