# Dusk — an 18+ couples intimacy, date-night & adventure app

A private, consent-first web app for couples: spin a wheel for date ideas, romantic
challenges, couple games and conversation prompts. Playful and romantic by design,
never graphic. **No account, no analytics, no server** — everything lives in the browser.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview
```

## What's implemented

| Area | Notes |
| --- | --- |
| **Age gate** | 18+ confirmation before entry, with an Exit path. Persisted locally. |
| **Consent-first** | Agreement card before any challenge session; Skip / Not tonight / Change category / Stop session attached to every challenge surface. |
| **Comfort levels** | Relaxed · Playful · Romantic · Adventurous. Gates both categories *and* per-activity difficulty. |
| **Spin the Night** | Custom SVG wheel: real easing, per-slice tick sounds, particle burst, reduced-motion fallback that resolves instantly. |
| **Randomisation** | Weighted engine that hard-avoids the last 12 items, damps recently-used categories, boosts well-rated ones and suppresses repeatedly-skipped ideas. |
| **Build our date** | Budget / location / time / mood → a sequenced multi-step plan that fits the time budget. |
| **Weekend mode** | Morning → Afternoon → Evening → Night, with distance and wet-weather adaptation. |
| **Surprise us** | Card-by-card reveal; nothing shown until you tap. |
| **Couple games** | Quiz with independent A/B answering + handoff screen and match/difference reveal; Who Knows Who; Ask and Play decks. |
| **Explore** | 321 activities, 18 tags, search, filters, infinite scroll. |
| **Saved / Journey** | Favourites and a grouped timeline (Today / Yesterday / Last week…) with ratings and private notes. |
| **Recommendations** | "You might like" — three category-diverse picks from your rating history. |
| **Gamification** | Points, levels, badges and a **pausable, guilt-free** streak. Can be switched off entirely. |
| **Private mode** | Blur + lock screen, auto-lock on inactivity and tab-hide. Honestly documents that browsers *cannot* block screenshots. |
| **Privacy** | Export JSON, delete history, delete favourites, wipe everything. |
| **Accessibility** | Keyboard nav, focus traps in modals, Escape to close, visible focus rings, reduced motion, large text, high contrast, labelled controls. |
| **Themes** | Dark-first, plus a tuned light mode. |

## Architecture

```
src/
  lib/
    data/
      rows-a.ts, rows-b.ts, rows-c.ts   # activity content (pipe-delimited rows)
      schema.ts                          # row parser + category registry
      activities.ts                      # assembles + indexes the library
      quiz.ts                            # quiz, who-knows-who, dailies, badges
    engine.ts                            # filtering, weighting, plan generators
    repository.ts                        # persistence boundary (swap for Supabase)
    types.ts                             # domain types mirroring a future schema
  store/app.ts                           # Zustand store, persists via repository
  components/                            # wheel, cards, sheets, nav, consent, a11y
  pages/                                 # landing + 11 app routes
```

### Adding content

Append one line to the relevant array in `src/lib/data/rows-*.ts`:

```
title | difficulty | minutes | location | cost | mood | tags | description
```

`difficulty` `e|m|b` · `location` `h|o|v|a|d` · `cost` `f|l|m|p` ·
`mood` `ro|fu|re|ad|sp|co|cr`. IDs are derived automatically.

To add a **category**, add an entry to `CATEGORIES` in `schema.ts` and register its
rows in `activities.ts` — the wheel, filters and explore tags pick it up automatically.

### Swapping local storage for a backend

Everything persisted goes through the `Repository` interface in `src/lib/repository.ts`.
Implement the same four methods against Supabase/Firebase and assign it to the exported
`repository` — no UI changes required. Types in `types.ts` already mirror the intended
tables (`users`, `couples`, `activities`, `categories`, `favorites`, `history`,
`ratings`, `sessions`).

## Safety

For consenting adults 18+. Content deliberately excludes anything dangerous, illegal,
non-consensual, coercive, humiliating, or involving public exposure. Nothing here is
therapy or a validated compatibility assessment. Every prompt is skippable.
