import { memo } from 'react'
import { useReducedMotion } from '@/hooks/useMotionPrefs'

/**
 * Ambient background: three slow gradient orbs plus a fine grain layer.
 * GPU-only properties, and it stops moving entirely under reduced motion.
 */
export const Atmosphere = memo(function Atmosphere() {
  const reduced = useReducedMotion()
  const anim = reduced ? '' : 'animate-drift'

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[rgb(var(--bg))]" />

      <div
        className={`atmo-orb absolute -top-[22%] -left-[14%] h-[62vh] w-[62vh] rounded-full blur-[110px] ${anim}`}
        style={{ background: 'radial-gradient(circle, rgba(224,67,106,.42), transparent 68%)', animationDelay: '0s' }}
      />
      <div
        className={`atmo-orb absolute top-[24%] -right-[16%] h-[70vh] w-[70vh] rounded-full blur-[130px] ${anim}`}
        style={{ background: 'radial-gradient(circle, rgba(124,83,232,.38), transparent 68%)', animationDelay: '-7s' }}
      />
      <div
        className={`atmo-orb absolute -bottom-[24%] left-[18%] h-[58vh] w-[58vh] rounded-full blur-[120px] ${anim}`}
        style={{ background: 'radial-gradient(circle, rgba(255,122,89,.24), transparent 70%)', animationDelay: '-14s' }}
      />

      {/* grain */}
      <div
        className="atmo-grain absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* vignette */}
      <div
        className="atmo-vignette absolute inset-0"
        style={{ background: 'radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,.42) 100%)' }}
      />
    </div>
  )
})
