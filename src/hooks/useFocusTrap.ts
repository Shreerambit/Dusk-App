import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus inside a modal surface while it is open.
 *
 * - locks body scroll
 * - moves focus to the first control in the panel
 * - cycles Tab / Shift+Tab within the panel so focus can never land on the
 *   page behind the dialog (screen-reader and keyboard users would otherwise
 *   silently operate hidden UI)
 * - calls onEscape when Escape is pressed, if provided
 * - restores focus to the previously focused element on close
 */
export function useFocusTrap<T extends HTMLElement>(
  open: boolean,
  onEscape?: () => void,
) {
  const ref = useRef<T>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.offsetParent !== null,
      )

    const t = window.setTimeout(() => focusables()[0]?.focus(), 60)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault()
        onEscape()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Focus escaped the panel entirely (or never entered) — pull it back in.
      if (!ref.current?.contains(active as Node)) {
        e.preventDefault()
        first.focus()
        return
      }
      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      restoreRef.current?.focus?.()
    }
  }, [open, onEscape])

  return ref
}
