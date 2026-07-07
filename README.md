# Fantasy Football Draft Tracker

A polished web application for the Dynasty Madness league: track rookie draft picks, run mock drafts, manage team rosters, and trade future picks with an Apple-style design.

## Features

- League newspaper home page ("The Dynasty Madness Times") with power rankings and per-team writeups
- Track draft picks in real-time with a pick timer
- Mock drafts with CPU auto-picks, persistence across refreshes, and past mock draft history
- Manage multiple team rosters (starters, bench)
- View, search, and filter the rookie prospect list
- Trade future draft picks (2026-2028) with auto-generated footnotes
- Upload prospect data via CSV/JSON (admin-only "Data" tab, visible after signing in as an admin)
- Beautiful Apple-inspired UI with light theme
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth API**: Vercel serverless functions (`frontend/api/`) backed by Neon Postgres
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chriscazenave-dev/Fantasy-Football-Draft-Tracker.git
   cd Fantasy-Football-Draft-Tracker/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

4. Build for production:
   ```bash
   npm run build
   ```

### Sign-in and environment variables

Sign-in is handled by the Vercel serverless functions in `frontend/api/` and requires two environment variables on the Vercel deployment:

- `AUTH_SECRET`: HMAC secret used to sign auth tokens
- `DATABASE_URL`: Neon Postgres connection string for the users table

These endpoints do not run under `npm run dev`, so **sign-in does not work in local development**. Use "Continue without signing in" to browse the app locally; everything except auth-gated editing works without an account.

## Live Demo

Visit the live application at: [https://fantasy-football-draft-tracker-one.vercel.app](https://fantasy-football-draft-tracker-one.vercel.app)

## Features Overview

### Home Tab
- The Dynasty Madness Times: league articles, preseason power rankings, and clickable per-team franchise writeups

### Prospects Tab
- View all rookie prospects with full names and NFL landing spots
- Filter by position and status, or search by name, NFL team, or college
- Run mock drafts (state survives page refreshes) and review past mock drafts
- See draft order and current pick

### Rosters Tab
- View all team rosters
- See drafted players by team
- Beautiful team icons and color coding

### Trades Tab
- Trade future draft picks (2026-2028) between teams
- Auto-generated trade footnotes synced with the Future Picks tab

### Data Upload (admin only)
- Upload prospect lists via CSV or JSON from the "Data" tab, which appears after signing in as an admin

## Testing

```bash
cd frontend
npm test        # run unit tests (Vitest)
npm run lint    # run ESLint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
