import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Download, Eye, Server, Trash2 } from 'lucide-react'
import { Button, GlassCard, Sheet } from '@/components/ui'
import { useApp } from '@/store/app'
import { ease } from '@/hooks/useMotionPrefs'

export default function Privacy() {
  const exportData = useApp((s) => s.exportData)
  const clearHistory = useApp((s) => s.clearHistory)
  const clearFavorites = useApp((s) => s.clearFavorites)
  const clearAll = useApp((s) => s.clearAll)
  const history = useApp((s) => s.history)
  const favorites = useApp((s) => s.favorites)
  const notify = useApp((s) => s.notify)

  const [confirm, setConfirm] = useState<null | 'all'>(null)

  function download() {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dusk-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    notify('Data exported')
  }

  return (
    <div className="space-y-5 pb-6">
      <header className="mb-2">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Data & privacy</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
          Dusk has no account system, no analytics and no server. Everything below lives in this browser
          only, and you can take it or delete it at any moment.
        </p>
      </header>

      <div className="grid gap-3.5 sm:grid-cols-3">
        {[
          { label: 'Saved items', value: favorites.length },
          { label: 'History entries', value: history.length },
          { label: 'Data sent to a server', value: 0 },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.5, ease }}
          >
            <GlassCard className="p-5">
              <div className="text-[26px] font-semibold">{s.value}</div>
              <div className="mt-1 text-[13px] text-muted">{s.label}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-6 sm:p-7">
        <h2 className="text-[18px] font-semibold">Your data</h2>
        <p className="mb-5 mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Export produces a readable JSON file containing your preferences, profile, saved items and history.
        </p>

        <div className="space-y-2.5">
          <Row
            title="Export everything"
            body="Download a JSON copy of all local data."
            action={<Button icon={<Download size={15} />} onClick={download}>Export</Button>}
          />
          <Row
            title="Delete history"
            body={`Removes all ${history.length} completed activities and notes.`}
            action={<Button variant="danger" icon={<Trash2 size={15} />} onClick={clearHistory} disabled={!history.length}>Delete</Button>}
          />
          <Row
            title="Delete saved items"
            body={`Removes all ${favorites.length} saved ideas and plans.`}
            action={<Button variant="danger" icon={<Trash2 size={15} />} onClick={clearFavorites} disabled={!favorites.length}>Delete</Button>}
          />
          <Row
            title="Clear all local data"
            body="Wipes preferences, profile, saved items and history. This is the equivalent of deleting your account."
            action={<Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setConfirm('all')}>Clear all</Button>}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-7">
        <h2 className="mb-4 text-[18px] font-semibold">What we collect</h2>
        <ul className="space-y-3">
          {[
            ['Nothing identifying', 'No name, email, phone number, location or contacts. The couple nickname is optional and never leaves the device.'],
            ['No tracking', 'No analytics, no cookies for advertising, no third-party scripts, no network requests for content.'],
            ['Local storage only', 'Preferences, saved items and history are stored in this browser under a single key you can wipe above.'],
            ['Ratings stay local', 'Ratings only feed the on-device recommendation engine.'],
          ].map(([t, b]) => (
            <li key={t} className="rounded-2xl bg-white/[0.04] p-4">
              <div className="text-[15px] font-medium">{t}</div>
              <div className="mt-1 text-[13.5px] leading-relaxed text-muted">{b}</div>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="p-6 sm:p-7">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={17} className="text-amber-300" />
          <h2 className="text-[18px] font-semibold">Honest limitations</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-400/10 p-4">
            <Eye size={15} className="mt-0.5 shrink-0 text-amber-300" />
            <p className="text-[13px] leading-relaxed text-amber-100/85">
              <strong className="font-semibold">Screenshots cannot be blocked.</strong> No website can reliably
              prevent a screenshot or a screen recording on any platform. Private Mode blurs content and
              auto-locks, which helps with someone glancing over your shoulder — it is not a technical guarantee.
            </p>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl bg-white/[0.05] p-4">
            <Server size={15} className="mt-0.5 shrink-0 text-muted" />
            <p className="text-[13px] leading-relaxed text-muted">
              Local storage is per-browser. Clearing your browser data, using private browsing, or switching
              device or browser means your saved items will not follow you. Export first if you care about them.
            </p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-7">
        <h2 className="mb-3 text-[18px] font-semibold">Safety</h2>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Dusk is for consenting adults aged 18 and over. Every prompt can be skipped without explanation,
          and no activity should ever be treated as an obligation. We deliberately exclude anything dangerous,
          illegal, non-consensual, humiliating, coercive, or involving public exposure. If a suggestion does
          not feel right for both of you, skip it — that is what the button is for.
        </p>
      </GlassCard>

      <Sheet
        open={confirm === 'all'}
        onClose={() => setConfirm(null)}
        title="Clear everything?"
      >
        <p className="-mt-2 text-[14.5px] leading-relaxed text-muted">
          This deletes your preferences, couple profile, saved items and full history from this browser.
          It cannot be undone. Consider exporting first.
        </p>
        <div className="mt-6 flex gap-2.5">
          <Button size="lg" className="flex-1" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => { clearAll(); setConfirm(null) }}
          >
            Delete everything
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

function Row({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.04] p-4">
      <div className="min-w-[200px] flex-1">
        <div className="text-[15px] font-medium">{title}</div>
        <div className="mt-1 text-[13px] leading-relaxed text-muted">{body}</div>
      </div>
      {action}
    </div>
  )
}
