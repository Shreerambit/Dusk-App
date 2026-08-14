import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui'
import { useApp } from '@/store/app'
import { ease } from '@/hooks/useMotionPrefs'
import { useFocusTrap } from '@/hooks/useFocusTrap'

/** Watches for inactivity and re-locks when Private Mode is on. */
export function useAutoLock() {
  const privateMode = useApp((s) => s.preferences.privateMode)
  const minutes = useApp((s) => s.preferences.autoLockMinutes)
  const lock = useApp((s) => s.lock)

  useEffect(() => {
    if (!privateMode || minutes <= 0) return
    let timer: number
    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(lock, minutes * 60_000)
    }
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    const onHide = () => { if (document.visibilityState === 'hidden') lock() }
    document.addEventListener('visibilitychange', onHide)
    reset()
    return () => {
      window.clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [privateMode, minutes, lock])
}

export function PrivateLock() {
  const unlock = useApp((s) => s.unlock)
  // No onEscape: the lock screen must not be dismissible by keystroke.
  const panelRef = useFocusTrap<HTMLDivElement>(true)

  return (
    <div className="fixed inset-0 z-[190] flex h-[100dvh] items-center justify-center p-6">
      <div className="absolute inset-0 bg-[rgb(var(--bg))]/92 backdrop-blur-3xl" />
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease }}
        className="relative w-full max-w-sm rounded-[32px] glass-strong p-8 text-center"
        role="dialog"
        aria-modal="true"
        aria-label="Private mode locked"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <Lock size={26} />
        </div>
        <h2 className="display text-[24px]">Private Mode</h2>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">
          Your content is hidden. Tap to continue where you left off.
        </p>
        <Button variant="primary" size="lg" full className="mt-6" onClick={unlock}>
          Unlock
        </Button>
      </motion.div>
    </div>
  )
}
