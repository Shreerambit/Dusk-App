import { useEffect, useState } from 'react'
import { useApp } from '@/store/app'

/** True when either the OS or the in-app setting asks for reduced motion. */
export function useReducedMotion() {
  const pref = useApp((s) => s.preferences.reducedMotion)
  const [system, setSystem] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystem(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystem(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return pref || system
}

/** Spring presets used across the app for a consistent feel. */
export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 420, damping: 34, mass: 0.7 },
  gentle: { type: 'spring', stiffness: 150, damping: 24 },
} as const

export const ease = [0.22, 1, 0.36, 1] as const
