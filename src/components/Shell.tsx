import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BottomNav, TopBar } from '@/components/Nav'
import { PrivateLock, useAutoLock } from '@/components/PrivateLock'
import { useApp } from '@/store/app'
import { useReducedMotion, ease } from '@/hooks/useMotionPrefs'

export function Shell() {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const pageRef = useRef<HTMLDivElement>(null)
  const locked = useApp((s) => s.locked)
  const privateMode = useApp((s) => s.preferences.privateMode)
  useAutoLock()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [pathname, reduced])

  return (
    <div className="relative min-h-full">
      <TopBar />

      <main
        id="main"
        className={`mx-auto w-[min(1180px,94vw)] pb-32 pt-6 md:pb-20 md:pt-8 ${
          privateMode && locked ? 'blurred-private' : ''
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: reduced ? 0.15 : 0.45, ease }}
            // A lingering `filter` (even blur(0)) makes this element the containing
            // block for descendant position:fixed elements, and keeps a compositing
            // layer alive. Strip it once the entrance finishes.
            onAnimationComplete={() => {
              if (pageRef.current) pageRef.current.style.filter = ''
            }}
            ref={pageRef}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
      {locked && <PrivateLock />}
    </div>
  )
}
