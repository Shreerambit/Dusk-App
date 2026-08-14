import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import { X } from 'lucide-react'
import { ease, spring } from '@/hooks/useMotionPrefs'
import { useFeedback } from '@/hooks/useHaptics'
import { useReducedMotion } from '@/hooks/useMotionPrefs'
import { useFocusTrap } from '@/hooks/useFocusTrap'

/* ---------------------------------------------------------------- Button */

type Variant = 'primary' | 'ghost' | 'quiet' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-[14.5px]',
  lg: 'h-13 px-7 text-[16px] py-3.5',
  xl: 'h-16 px-9 text-[17px]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  full?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', icon, full, className = '', children, onClick, ...rest },
  ref,
) {
  const feedback = useFeedback()
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'danger'
        ? 'bg-rose-500/15 text-rose-300 border border-rose-400/25 hover:bg-rose-500/25'
        : variant === 'quiet'
          ? 'text-muted hover:text-[rgb(var(--text))]'
          : 'btn-ghost'

  return (
    <button
      ref={ref}
      className={`btn ${SIZES[size]} ${variantClass} ${full ? 'w-full' : ''} disabled:opacity-40 disabled:pointer-events-none ${className}`}
      onClick={(e) => { feedback('tap'); onClick?.(e) }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
})

/* ------------------------------------------------------------------ Card */

export function GlassCard({
  children, className = '', hover = false, ...rest
}: HTMLMotionProps<'div'> & { hover?: boolean }) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={`card ${className}`}
      whileHover={hover && !reduced ? { y: -4, transition: { duration: 0.35, ease } } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/* ----------------------------------------------------------------- Sheet */

export function Sheet({
  open, onClose, title, children, footer, maxWidth = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}) {
  const reduced = useReducedMotion()
  // Scroll lock, focus trap, Escape-to-close and focus restore all live in the hook.
  const panelRef = useFocusTrap<HTMLDivElement>(open, onClose)

  // Portal to <body>: ancestors with filter/backdrop-filter/transform would
  // otherwise become the containing block for position:fixed and shift the sheet.
  return createPortal(
    <AnimatePresence>
      {open && (
        // h-[100dvh] tracks the *visual* viewport on mobile browsers, where the
        // collapsing URL bar makes 100vh taller than what is actually on screen.
        <div className="fixed inset-0 z-[100] flex h-[100dvh] items-end justify-center sm:items-center">
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${maxWidth} glass-strong rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7 m-0 sm:m-6 max-h-[88dvh] overflow-y-auto overscroll-contain no-scrollbar safe-bottom`}
            initial={reduced ? { opacity: 0 } : { y: '6%', opacity: 0, scale: 0.98 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: '6%', opacity: 0, scale: 0.98 }}
            transition={spring.soft}
          >
            <div className="sm:hidden mx-auto mb-4 h-1.5 w-11 rounded-full bg-white/20" />
            {title && (
              <div className="mb-5 flex items-start justify-between gap-4">
                <h2 className="text-[22px] display">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 rounded-full p-2 text-muted hover:text-[rgb(var(--text))] hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/* ------------------------------------------------------------- Selectors */

export function SegmentedControl<T extends string>({
  options, value, onChange, label, columns,
}: {
  options: Array<{ value: T; label: string; hint?: string }>
  value: T
  onChange: (v: T) => void
  label?: string
  columns?: number
}) {
  const feedback = useFeedback()
  return (
    <div>
      {label && <div className="mb-2.5 text-[13px] font-medium text-muted">{label}</div>}
      <div
        role="radiogroup"
        aria-label={label}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns ?? Math.min(options.length, 3)}, minmax(0,1fr))` }}
      >
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              role="radio"
              aria-checked={active}
              onClick={() => { feedback('tap'); onChange(o.value) }}
              className={`relative rounded-2xl px-3 py-3 text-[13.5px] font-medium transition-all duration-300 ease-spring ${
                active ? 'text-white' : 'text-muted hover:text-[rgb(var(--text))]'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {active && (
                <motion.span
                  layoutId={`seg-${label ?? 'x'}`}
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(255,107,139,.95), rgba(168,74,224,.9))' }}
                  transition={spring.snappy}
                />
              )}
              {!active && <span className="absolute inset-0 rounded-2xl glass" />}
              <span className="relative z-10 block leading-tight">{o.label}</span>
              {o.hint && <span className="relative z-10 mt-0.5 block text-[11px] opacity-70">{o.hint}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Toggle({
  checked, onChange, label, description,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const feedback = useFeedback()
  return (
    <div className="flex items-start justify-between gap-5 py-3.5">
      <div className="min-w-0">
        <div className="text-[15px] font-medium">{label}</div>
        {description && <div className="mt-1 text-[13px] leading-relaxed text-muted">{description}</div>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => { feedback('tap'); onChange(!checked) }}
        className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-gradient-to-r from-rose-500 to-purple-500' : 'bg-white/15'
        }`}
      >
        <motion.span
          layout
          transition={spring.snappy}
          className="absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-md"
          style={{ left: checked ? 25 : 3 }}
        />
      </button>
    </div>
  )
}

/* ------------------------------------------------------------ Scroll fade */

export function Reveal({
  children, delay = 0, y = 26, className = '',
}: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ Meta */

export function MetaPill({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="chip whitespace-nowrap">
      {icon}
      {children}
    </span>
  )
}

export function SectionTitle({
  eyebrow, title, subtitle, center,
}: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">{eyebrow}</div>
      )}
      <h2 className="display text-[clamp(28px,5vw,46px)]">{title}</h2>
      {subtitle && (
        <p className={`mt-3 max-w-2xl text-[15px] leading-relaxed text-muted ${center ? 'mx-auto' : ''}`}>{subtitle}</p>
      )}
    </div>
  )
}
