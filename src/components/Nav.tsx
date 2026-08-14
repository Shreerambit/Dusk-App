import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bookmark, Compass, Heart, Home, Sparkles, User } from 'lucide-react'
import { useFeedback } from '@/hooks/useHaptics'
import { spring } from '@/hooks/useMotionPrefs'

const TABS = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/explore', label: 'Explore', icon: Compass },
  { to: '/app/spin', label: 'Spin', icon: Sparkles, center: true },
  { to: '/app/saved', label: 'Saved', icon: Bookmark },
  { to: '/app/profile', label: 'Profile', icon: User },
]

const DESKTOP_LINKS = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/spin', label: 'Spin' },
  { to: '/app/date', label: 'Date' },
  { to: '/app/games', label: 'Games' },
  { to: '/app/weekend', label: 'Weekend' },
  { to: '/app/explore', label: 'Explore' },
  { to: '/app/journey', label: 'Journey' },
  { to: '/app/saved', label: 'Saved' },
]

export function TopBar() {
  const feedback = useFeedback()
  return (
    <header className="sticky top-0 z-50 hidden md:block">
      <div className="mx-auto mt-4 flex w-[min(1180px,94vw)] items-center justify-between rounded-full glass px-5 py-2.5">
        <NavLink to="/" className="flex items-center gap-2.5 pr-4" aria-label="Dusk home">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg,#ff6b8b,#7c53e8)' }}
          >
            <Heart size={16} className="text-white" fill="white" />
          </span>
          <span className="text-[16px] font-semibold tracking-tight">Dusk</span>
        </NavLink>

        <nav className="flex items-center gap-1" aria-label="Main">
          {DESKTOP_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => feedback('tap')}
              className={({ isActive }) =>
                `relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-300 ${
                  isActive ? 'text-[rgb(var(--text))]' : 'text-muted hover:text-[rgb(var(--text))]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/10" transition={spring.snappy} />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/app/profile"
          onClick={() => feedback('tap')}
          className="rounded-full glass px-4 py-2 text-[13.5px] font-medium hover:bg-white/10 transition-colors"
        >
          Profile
        </NavLink>
      </div>
    </header>
  )
}

export function BottomNav() {
  const feedback = useFeedback()
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[rgb(var(--bg))] via-[rgb(var(--bg))]/80 to-transparent" />
      <div className="relative mx-3 mb-3 flex items-end justify-around rounded-[26px] glass-strong px-2 py-2">
        {TABS.map((t) => {
          const active = t.end ? pathname === t.to : pathname.startsWith(t.to)
          const Icon = t.icon

          if (t.center) {
            return (
              <NavLink
                key={t.to}
                to={t.to}
                onClick={() => feedback('tap', [8, 24, 8])}
                aria-label="Spin the night"
                className="relative -mt-8 flex flex-col items-center"
              >
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  transition={spring.snappy}
                  className="flex h-[58px] w-[58px] items-center justify-center rounded-full shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg,#ff6b8b,#e0436a 48%,#a84ae0)',
                    boxShadow: '0 12px 30px -8px rgba(224,67,106,.75)',
                  }}
                >
                  <Icon size={24} className="text-white" />
                </motion.span>
                <span className={`mt-1 text-[10.5px] font-semibold ${active ? 'text-[rgb(var(--text))]' : 'text-muted'}`}>
                  {t.label}
                </span>
              </NavLink>
            )
          }

          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              onClick={() => feedback('tap')}
              className="relative flex min-w-[58px] flex-col items-center gap-1 rounded-2xl px-2 py-2"
            >
              <Icon size={21} className={active ? 'text-rose-300' : 'text-muted'} />
              <span className={`text-[10.5px] font-medium ${active ? 'text-[rgb(var(--text))]' : 'text-muted'}`}>
                {t.label}
              </span>
              {active && (
                <motion.span
                  layoutId="tab-dot"
                  className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-rose-400"
                  transition={spring.snappy}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
