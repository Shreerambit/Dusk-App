import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'

import { Atmosphere } from '@/components/Atmosphere'
import { AgeGate } from '@/components/AgeGate'
import { Shell } from '@/components/Shell'
import { useApp } from '@/store/app'

import Landing from '@/pages/Landing'
import HomePage from '@/pages/Home'

const SpinPage = lazy(() => import('@/pages/Spin'))
const DatePage = lazy(() => import('@/pages/DateBuilder'))
const GamesPage = lazy(() => import('@/pages/Games'))
const ExplorePage = lazy(() => import('@/pages/Explore'))
const SavedPage = lazy(() => import('@/pages/Saved'))
const JourneyPage = lazy(() => import('@/pages/Journey'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const WeekendPage = lazy(() => import('@/pages/Weekend'))
const SurprisePage = lazy(() => import('@/pages/Surprise'))
const PrivacyPage = lazy(() => import('@/pages/Privacy'))

function Loading() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-rose-400" aria-label="Loading" />
    </div>
  )
}

function Toast() {
  const toast = useApp((s) => s.toast)
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed bottom-28 left-1/2 z-[150] -translate-x-1/2 rounded-full glass-strong px-5 py-3 text-[14px] font-medium shadow-2xl md:bottom-8"
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ThemeSync() {
  const prefs = useApp((s) => s.preferences)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('light', prefs.theme === 'light')
    root.classList.toggle('dark', prefs.theme === 'dark')
    root.classList.toggle('contrast', prefs.highContrast)
    root.classList.toggle('large-text', prefs.largeText)
    root.classList.toggle('reduce-motion', prefs.reducedMotion)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', prefs.theme === 'light' ? '#f8f7fa' : '#08080b')
  }, [prefs.theme, prefs.highContrast, prefs.largeText, prefs.reducedMotion])
  return null
}

function App() {
  const hydrate = useApp((s) => s.hydrate)
  const hydrated = useApp((s) => s.hydrated)
  const ageVerified = useApp((s) => s.ageVerified)

  useEffect(() => { void hydrate() }, [hydrate])

  return (
    <>
      <Atmosphere />
      <ThemeSync />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-black"
      >
        Skip to content
      </a>

      {hydrated && !ageVerified && <AgeGate />}

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Shell />}>
            <Route index element={<HomePage />} />
            <Route path="spin" element={<SpinPage />} />
            <Route path="date" element={<DatePage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="weekend" element={<WeekendPage />} />
            <Route path="surprise" element={<SurprisePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="saved" element={<SavedPage />} />
            <Route path="journey" element={<JourneyPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="privacy" element={<PrivacyPage />} />
          </Route>
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>

      <Toast />
    </>
  )
}

// The standalone single-file build runs from file:// (or a sandboxed iframe)
// where there is no server to resolve deep paths, so it needs hash routing.
const Router = import.meta.env.VITE_STANDALONE ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
