import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Clock, Gauge, Home, MapPin, Sparkles, Users, Wallet } from 'lucide-react'
import type { Activity } from '@/lib/types'
import { CATEGORY_MAP, COST_LABEL, DIFFICULTY_LABEL, LOCATION_LABEL, MOOD_LABEL, formatDuration } from '@/lib/data/schema'
import { MetaPill } from '@/components/ui'
import { useApp } from '@/store/app'
import { useFeedback } from '@/hooks/useHaptics'
import { ease } from '@/hooks/useMotionPrefs'

export function CategoryBadge({ id, className = '' }: { id: Activity['category']; className?: string }) {
  const c = CATEGORY_MAP[id]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  )
}

export function ActivityMeta({ activity, compact }: { activity: Activity; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <MetaPill icon={<Clock size={13} />}>{formatDuration(activity.duration)}</MetaPill>
      <MetaPill icon={<Wallet size={13} />}>{COST_LABEL[activity.cost]}</MetaPill>
      <MetaPill icon={activity.location === 'home' ? <Home size={13} /> : <MapPin size={13} />}>
        {LOCATION_LABEL[activity.location]}
      </MetaPill>
      {!compact && <MetaPill icon={<Sparkles size={13} />}>{MOOD_LABEL[activity.mood]}</MetaPill>}
      {!compact && <MetaPill icon={<Gauge size={13} />}>{DIFFICULTY_LABEL[activity.difficulty]}</MetaPill>}
      {!compact && <MetaPill icon={<Users size={13} />}>{activity.participants}</MetaPill>}
    </div>
  )
}

export function SaveButton({ activity, className = '' }: { activity: Activity; className?: string }) {
  const isFav = useApp((s) => s.isFavorite(activity.id))
  const toggle = useApp((s) => s.toggleFavorite)
  const feedback = useFeedback()

  return (
    <button
      aria-label={isFav ? `Remove ${activity.title} from saved` : `Save ${activity.title} for later`}
      aria-pressed={isFav}
      onClick={() => {
        const added = toggle({
          kind: 'activity',
          activityId: activity.id,
          title: activity.title,
          subtitle: CATEGORY_MAP[activity.category].label,
        })
        feedback(added ? 'confirm' : 'tap', added ? [10, 40, 12] : 8)
      }}
      className={`rounded-full p-2.5 transition-all duration-300 ease-spring active:scale-90 ${
        isFav ? 'text-rose-300 bg-rose-500/15' : 'text-muted hover:text-[rgb(var(--text))] hover:bg-white/10'
      } ${className}`}
    >
      {isFav ? <BookmarkCheck size={19} /> : <Bookmark size={19} />}
    </button>
  )
}

export function ActivityCard({
  activity, index = 0, onClick, showSave = true,
}: { activity: Activity; index?: number; onClick?: () => void; showSave?: boolean }) {
  const c = CATEGORY_MAP[activity.category]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.045, 0.4), ease }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[28px] glass p-5 sm:p-6 text-left"
      style={{ boxShadow: '0 26px 60px -40px rgba(0,0,0,.9)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.22] blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <CategoryBadge id={activity.category} />
        {showSave && <SaveButton activity={activity} />}
      </div>

      <button
        onClick={onClick}
        disabled={!onClick}
        className="relative mt-4 block w-full text-left disabled:cursor-default"
      >
        <h3 className="display text-[20px] sm:text-[22px]">{activity.title}</h3>
        <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{activity.description}</p>
      </button>

      <div className="relative mt-5">
        <ActivityMeta activity={activity} compact />
      </div>
    </motion.article>
  )
}
