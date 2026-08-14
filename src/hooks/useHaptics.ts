import { useCallback } from 'react'
import { useApp } from '@/store/app'
import { sfx, type SfxName } from '@/lib/sound'

/**
 * Combined "feedback" hook: optional sound + real vibration where supported.
 * Visual feedback is handled per-component with spring scale transforms.
 */
export function useFeedback() {
  const soundOn = useApp((s) => s.preferences.sound)

  return useCallback(
    (name: SfxName = 'tap', vibrate: number | number[] = 8) => {
      if (soundOn) sfx[name]()
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(vibrate) } catch { /* unsupported */ }
      }
    },
    [soundOn],
  )
}
