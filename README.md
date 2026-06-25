# ChessMate v2.0 — Upgraded

India's Chess Tournament Hub — now with real Stockfish engine analysis.

## What's New in v2.0

### 🔥 Real Stockfish Engine
- **Best move suggestion** — highlighted square and arrow on the board
- **3 analysis lines** (MultiPV) with centipawn / mate scores
- **Live depth counter** while engine is computing
- **Graceful fallback** — heuristic eval if Stockfish fails to load
- Depth slider 8–24 for speed/accuracy tradeoff

### 🎨 UI/UX Upgrades
- **Best move banner** below board — shows best move in SAN notation + eval score
- **Board highlights** — from/to squares glow when best move is shown
- **Custom arrows** — golden arrow drawn from best move source to target
- **Engine status indicator** — green pulse (Stockfish), amber (heuristic), grey (loading)
- **Turn indicator** in the moves panel
- **Game status banner** — checkmate, stalemate, draw, check notifications
- Refined navbar with scroll-shadow and improved avatar design
- Cleaner hero section with subtle radial gradient
- Input fields with focus glow effect
- Improved pagination with smart ellipsis
- Consistent hover states using `cm-accent` throughout

### 🔐 Authentication (Supabase + Google OAuth)
- **Google Sign-In** — one-click login via Google OAuth
- **Email/Password** — traditional auth via Supabase Auth
- **50,000 user cap** — registration limit enforced server-side
- **Auto-profile creation** — PlayerProfile created on first login
- Session managed by Supabase with auto-refresh

### 🛠 Stability Fixes
- Proper `useEffect` cleanup — engine stops on unmount, debounced analysis
- Navigation (prev/next/start/end) clears stale arrows
- FEN/PGN load clears all previous state
- No more random fake eval — all evaluation is real or clearly labelled
- TypeScript strictness improved on engine message parser

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # set DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npx prisma db push
npx ts-node prisma/seed.ts
npm run dev

# Frontend
cd frontend
npm install
cp .env.example .env   # set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Google OAuth** in Authentication → Providers → Google
3. Set the redirect URL to: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Copy your credentials to the `.env` files:
   - **Backend**: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - **Frontend**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Stockfish Integration

The engine loads via CDN (stockfish.js@10.0.2) as a Web Worker. It requires:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These headers are set automatically in `vite.config.ts` for local dev.
For production, configure them in your web server / CDN.

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS v3 (custom `cm-*` tokens)
- chess.js for game logic
- react-chessboard for the board UI
- Stockfish.js (CDN Web Worker) for engine
- TanStack Query v5 for data fetching
- **Supabase Auth** (Google OAuth + email/password)
- **Supabase PostgreSQL** (database)
- Express + Prisma (backend API)
