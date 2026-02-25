# Lufga Focus — Time Tracking App (Expo + React Native)

A three-space time tracking experience inspired by the provided dark, glassmorphism smart-speaker UI style.

## What was implemented

### 1) Home Space
- Goal picker (`Goal A`, `Goal B`, `Goal C`)
- Adjustable timer with presets (15/25/45 min)
- Start / Pause / Reset controls
- Manual session logging for partially completed focus sessions
- Live progress snapshot for the currently selected goal

### 2) Goal Space
- Card-based goal dashboard
- Weekly target minutes per goal
- Per-goal progress bar
- Streak count per goal (consecutive active days)
- Quick “Track with Timer” goal routing

### 3) Analytics Space
- GitHub-style 12-week heatmap based on logged minutes/day
- Total focused minutes summary
- Recent sessions timeline

## UI system extracted from inspiration

- **Primary accent:** `#F66C3F`
- **Base dark:** `#000000`, `#1D1F25`, `#28292D`, `#34363B`
- **Light neutral:** `#FFFFFF`, `#C7BCB6`
- **Form language:** oversized radii, soft contrast cards, prominent central controls
- **Typography approach:** strong hierarchy with large hero numerals for timer + compact metadata labels

## Run

```bash
npm install
npm run start
```

For web preview:

```bash
npm run web
```
