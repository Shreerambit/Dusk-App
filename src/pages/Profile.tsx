import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Award, Bell, Contrast, Eye, Lock, Moon, Shield, Sparkles, Sun, Type, Volume2, Zap } from 'lucide-react'
import type { Cost, LocationKind, Mood } from '@/lib/types'
import { Button, GlassCard, SegmentedControl, Toggle } from '@/components/ui'
import { ComfortPicker } from '@/components/ConsentControls'
import { useApp } from '@/store/app'
import { MOOD_LABEL, LOCATION_LABEL } from '@/lib/data/schema'
import { ease } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'

const MOODS = Object.keys(MOOD_LABEL) as Mood[]
const LOCATIONS = (Object.keys(LOCATION_LABEL) as LocationKind[]).filter((l) => l !== 'anywhere')

export default function Profile() {
  const profile = useApp((s) => s.profile)
  const setProfile = useApp((s) => s.setProfile)
  const prefs = useApp((s) => s.preferences)
  const setPrefs = useApp((s) => s.setPrefs)
  const badges = useApp((s) => s.badges)
  const level = useApp((s) => s.level)
  const stats = useApp((s) => s.stats)
  const notify = useApp((s) => s.notify)
  const feedback = useFeedback()

  const [nickname, setNickname] = useState(profile?.nickname ?? '')
  const [dateStyle, setDateStyle] = useState(profile?.favoriteDateStyle ?? '')
  const [moods, setMoods] = useState<Mood[]>(profile?.favoriteMoods ?? [])
  const [locs, setLocs] = useState<LocationKind[]>(profile?.favoriteLocations ?? [])
  const [budget, setBudget] = useState<Cost | 'any'>(profile?.preferredBudget ?? 'any')

  const lvl = level()
  const earned = badges()

  function save() {
    setProfile({
      nickname: nickname.trim(),
      favoriteMoods: moods,
      favoriteLocations: locs,
      preferredBudget: budget,
      favoriteDateStyle: dateStyle.trim(),
      createdAt: profile?.createdAt ?? Date.now(),
    })
    feedback('confirm')
    notify('Couple profile saved')
  }

  return (
    <div className="space-y-5 pb-6">
      <header className="mb-2">
        <h1 className="display text-[clamp(30px,6.5vw,48px)]">Profile</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
          Private to this device. We only ask for what actually improves your suggestions.
        </p>
      </header>

      {/* ------------------------------------------------------ level card */}
      {prefs.gamification && (
        <GlassCard className="relative overflow-hidden p-6 sm:p-7">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-3xl"
            style={{ background: 'linear-gradient(135deg,#ff6b8b,#a84ae0)' }}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                Level {lvl.level}
              </div>
              <div className="display mt-1.5 text-[28px]">{lvl.label}</div>
            </div>
            <div className="flex gap-5 text-center">
              {[
                ['Points', stats.points], ['Spins', stats.spins], ['Done', stats.completed],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <div className="text-[20px] font-semibold">{v as number}</div>
                  <div className="text-[11.5px] uppercase tracking-wide text-muted">{l as string}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#ff6b8b,#a84ae0)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(lvl.progress * 100)}%` }}
              transition={{ duration: 1, ease }}
            />
          </div>
        </GlassCard>
      )}

      {/* --------------------------------------------------- couple profile */}
      <GlassCard className="p-6 sm:p-7">
        <h2 className="text-[18px] font-semibold">Couple profile</h2>
        <p className="mb-5 mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Optional. No names, emails or anything identifying required.
        </p>

        <div className="space-y-5">
          <Field label="Couple nickname" id="nickname">
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={40}
              placeholder="e.g. The Sunday Club"
              className="h-12 w-full rounded-2xl glass px-4 text-[15px] placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
            />
          </Field>

          <Field label="Favourite date style" id="datestyle">
            <input
              id="datestyle"
              value={dateStyle}
              onChange={(e) => setDateStyle(e.target.value)}
              maxLength={60}
              placeholder="e.g. Long dinners and longer walks"
              className="h-12 w-full rounded-2xl glass px-4 text-[15px] placeholder:text-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
            />
          </Field>

          <div>
            <div className="mb-2.5 text-[13px] font-medium text-muted">Favourite moods</div>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => {
                const active = moods.includes(m)
                return (
                  <button
                    key={m}
                    onClick={() => { feedback('tap'); setMoods((p) => (p.includes(m) ? p.filter((x) => x !== m) : [...p, m])) }}
                    aria-pressed={active}
                    className={`chip transition-all duration-300 ${active ? 'border-transparent bg-gradient-to-r from-rose-500 to-purple-500 text-white' : 'hover:bg-white/10'}`}
                  >
                    {MOOD_LABEL[m]}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-2.5 text-[13px] font-medium text-muted">Favourite locations</div>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((l) => {
                const active = locs.includes(l)
                return (
                  <button
                    key={l}
                    onClick={() => { feedback('tap'); setLocs((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l])) }}
                    aria-pressed={active}
                    className={`chip transition-all duration-300 ${active ? 'border-transparent bg-gradient-to-r from-rose-500 to-purple-500 text-white' : 'hover:bg-white/10'}`}
                  >
                    {LOCATION_LABEL[l]}
                  </button>
                )
              })}
            </div>
          </div>

          <SegmentedControl
            label="Preferred budget"
            options={[
              { value: 'any', label: 'Any' }, { value: 'free', label: 'Free' }, { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' }, { value: 'premium', label: 'Premium' },
            ]}
            value={budget}
            onChange={setBudget}
            columns={3}
          />

          <Button variant="primary" size="lg" full onClick={save}>Save profile</Button>
        </div>
      </GlassCard>

      {/* -------------------------------------------------------- comfort */}
      <GlassCard className="p-6 sm:p-7">
        <h2 className="text-[18px] font-semibold">Comfort level</h2>
        <p className="mb-5 mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Filters every suggestion. Bolder categories only appear at higher levels, and either of you can
          lower it at any time.
        </p>
        <ComfortPicker />
      </GlassCard>

      {/* ------------------------------------------------------ appearance */}
      <GlassCard className="p-6 sm:p-7">
        <h2 className="mb-4 text-[18px] font-semibold">Appearance & accessibility</h2>

        <SegmentedControl
          label="Theme"
          options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
          value={prefs.theme}
          onChange={(v) => setPrefs({ theme: v })}
          columns={2}
        />

        <div className="mt-3 divide-y divide-white/[0.06]">
          <Toggle
            label="Sound effects"
            description="Soft ticks while the wheel spins and a small chime on results. Off by default."
            checked={prefs.sound}
            onChange={(v) => setPrefs({ sound: v })}
          />
          <Toggle
            label="Reduced motion"
            description="Removes the spin animation and card flips. Your system setting is respected automatically."
            checked={prefs.reducedMotion}
            onChange={(v) => setPrefs({ reducedMotion: v })}
          />
          <Toggle
            label="Larger text"
            description="Increases the base font size across the whole app."
            checked={prefs.largeText}
            onChange={(v) => setPrefs({ largeText: v })}
          />
          <Toggle
            label="High contrast"
            description="Stronger surfaces and borders for better legibility."
            checked={prefs.highContrast}
            onChange={(v) => setPrefs({ highContrast: v })}
          />
          <Toggle
            label="Points, levels and badges"
            description="Turn gamification off entirely if it feels like pressure."
            checked={prefs.gamification}
            onChange={(v) => setPrefs({ gamification: v })}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-muted">
          {[Moon, Sun, Volume2, Zap, Type, Contrast].map((I, i) => <I key={i} size={15} />)}
        </div>
      </GlassCard>

      {/* --------------------------------------------------------- badges */}
      {prefs.gamification && (
        <GlassCard className="p-6 sm:p-7">
          <div className="mb-5 flex items-center gap-2">
            <Award size={18} className="text-amber-300" />
            <h2 className="text-[18px] font-semibold">Badges</h2>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {earned.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.45, ease }}
                className={`flex items-start gap-3 rounded-2xl p-4 transition-colors ${b.earned ? 'bg-white/[0.08]' : 'bg-white/[0.03]'}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${b.earned ? 'bg-gradient-to-br from-amber-400 to-rose-500' : 'bg-white/[0.06]'}`}>
                  <Sparkles size={15} className={b.earned ? 'text-white' : 'text-muted'} />
                </span>
                <div className={b.earned ? '' : 'opacity-55'}>
                  <div className="text-[14.5px] font-medium">{b.label}</div>
                  <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{b.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* --------------------------------------------------- private mode */}
      <GlassCard className="p-6 sm:p-7">
        <div className="mb-1 flex items-center gap-2">
          <Lock size={17} className="text-rose-300" />
          <h2 className="text-[18px] font-semibold">Private mode</h2>
        </div>
        <p className="mb-2 mt-1.5 text-[13.5px] leading-relaxed text-muted">
          Blurs the interface behind a lock screen, hides your history and re-locks after inactivity or when
          you switch tabs.
        </p>

        <div className="divide-y divide-white/[0.06]">
          <Toggle
            label="Enable private mode"
            checked={prefs.privateMode}
            onChange={(v) => setPrefs({ privateMode: v })}
          />
          {prefs.privateMode && (
            <div className="py-4">
              <SegmentedControl
                label="Auto-lock after"
                options={[
                  { value: '1', label: '1 min' }, { value: '5', label: '5 min' },
                  { value: '15', label: '15 min' }, { value: '0', label: 'Never' },
                ]}
                value={String(prefs.autoLockMinutes)}
                onChange={(v) => setPrefs({ autoLockMinutes: Number(v) })}
                columns={4}
              />
            </div>
          )}
          <Toggle
            label="Notifications"
            description='If enabled, alerts never describe an activity — only "Your couple challenge is ready."'
            checked={prefs.notificationsEnabled}
            onChange={(v) => setPrefs({ notificationsEnabled: v })}
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-400/10 p-4">
          <Eye size={15} className="mt-0.5 shrink-0 text-amber-300" />
          <p className="text-[12.5px] leading-relaxed text-amber-100/85">
            Browsers cannot reliably prevent screenshots or screen recording. Private Mode reduces what is
            visible on screen, but it cannot guarantee that a screenshot is impossible.
          </p>
        </div>
      </GlassCard>

      <Link to="/app/privacy" className="block">
        <GlassCard className="flex items-center justify-between gap-4 p-6 transition-colors hover:bg-white/[0.08]" hover>
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-emerald-300" />
            <div>
              <div className="text-[16px] font-semibold">Data & privacy controls</div>
              <div className="mt-0.5 text-[13px] text-muted">Export, delete history, wipe everything.</div>
            </div>
          </div>
          <Bell size={16} className="text-muted" />
        </GlassCard>
      </Link>
    </div>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-[13px] font-medium text-muted">{label}</label>
      {children}
    </div>
  )
}
