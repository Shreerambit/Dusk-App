import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui'
import { useApp } from '@/store/app'
import { ease } from '@/hooks/useMotionPrefs'
import { useFocusTrap } from '@/hooks/useFocusTrap'

export function AgeGate() {
  const verifyAge = useApp((s) => s.verifyAge)
  // No onEscape: the gate is not dismissible — the only ways out are
  // confirming 18+ or leaving the site.
  const panelRef = useFocusTrap<HTMLDivElement>(true)

  return (
    <div className="fixed inset-0 z-[200] flex h-[100dvh] items-center justify-center overflow-y-auto p-5">
      <div className="absolute inset-0 bg-[rgb(var(--bg))]/85 backdrop-blur-2xl" />
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        className="relative my-auto w-full max-w-md rounded-[32px] glass-strong p-8 text-center shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-[26px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#ff6b8b,#e0436a 50%,#a84ae0)' }}
        >
          18+
        </motion.div>

        <h1 id="age-gate-title" className="display text-[30px]">Adults only</h1>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
          This experience is intended for adults aged 18 and over. Dusk contains romantic and flirty
          prompts for couples. It never shows graphic sexual content.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Button variant="primary" size="lg" full onClick={verifyAge}>
            I'm 18+
          </Button>
          <Button
            size="lg"
            full
            onClick={() => {
              window.location.replace('https://www.google.com')
            }}
          >
            Exit
          </Button>
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-2xl bg-white/[0.04] p-3.5 text-left">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-300/80" />
          <p className="text-[12.5px] leading-relaxed text-muted">
            Everything you save stays in this browser. No account, no tracking, no data sent anywhere.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
