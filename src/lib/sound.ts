/**
 * Tiny WebAudio synth — no audio files, no network, a few hundred bytes of code.
 * Everything is opt-in and defaults to off.
 */

let ctx: AudioContext | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip(freq: number, duration: number, type: OscillatorType, gain: number) {
  const c = context()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  g.gain.setValueAtTime(0, c.currentTime)
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration)
  osc.connect(g).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + duration + 0.02)
}

export const sfx = {
  tick(intensity = 1) {
    blip(1400 + Math.random() * 260, 0.028, 'square', 0.018 * intensity)
  },
  success() {
    blip(523.25, 0.12, 'sine', 0.05)
    setTimeout(() => blip(659.25, 0.12, 'sine', 0.05), 90)
    setTimeout(() => blip(783.99, 0.22, 'sine', 0.045), 180)
  },
  confirm() {
    blip(659.25, 0.1, 'sine', 0.045)
    setTimeout(() => blip(987.77, 0.18, 'sine', 0.035), 80)
  },
  tap() {
    blip(880, 0.035, 'sine', 0.025)
  },
  reveal() {
    blip(392, 0.14, 'triangle', 0.035)
    setTimeout(() => blip(587.33, 0.2, 'triangle', 0.03), 110)
  },
}

export type SfxName = keyof typeof sfx
