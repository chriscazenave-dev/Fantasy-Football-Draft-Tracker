---
name: testing-draft-tracker
description: Test the Fantasy Football Draft Tracker (Dynasty Madness) frontend end-to-end — Paper pages, Draft board, Trades, Rosters, Future Picks, and mock drafts. Use when verifying UI or draft-logic changes.
---

# Testing the Dynasty Madness Draft Tracker

## Setup
1. Start the dev server: `cd frontend && npm install && npm run dev` (serves at http://localhost:5173). Vite may require a newer Node (20.19+); if the build fails, check the Node version first.
2. The app is a pure client-side React/Vite app — all state (rosters, trades, footnotes) lives in memory/localStorage, so trades and mock drafts done during testing do NOT persist to the repo and reset on reload.
3. **Auth**: admin actions (executing trades) require a login token in localStorage under `dynasty_auth_token`. The client decodes a JWT-like payload from the token's first segment without signature validation (see `frontend/src/auth.js`), so for testing you can craft a base64url-encoded JSON payload and inject it via Playwright over CDP (`http://localhost:29229`) with `page.evaluate`, then reload. Playwright's Python sync API (`pip install playwright`) works well for this.

## Golden-path tests
- **The Paper (Home)**: 3 newspaper pages; navigation should switch content instantly (page-flip animation was removed — if you see a 3D flip, it may have regressed).
- **Logo**: favicon and header should show the DM logo from `frontend/public/logo.svg` (not the Vite bolt).
- **Draft tab** (renamed from "Prospects"): order bar is generated from the Future Picks 2026 ownership grid via `generatePicksFromFutureData` in `frontend/src/draftLogic.js`, using `DRAFT_SLOT_ORDER` in `futurePicksData.js` (linear, non-snake, 4 rounds × 8 teams). Verify "via X" tags match the Future Picks tab.
- **Trades**: select Team A/B, click player chips and/or pick chips on both sides, Execute Trade. Verify (a) a new numbered footnote appears at the bottom of the Future Picks tab, and (b) both rosters swapped the players (incoming players land on the bench; a traded-away starter leaves an Empty slot — this is expected).
- **Mock draft**: Draft tab → Mock Draft → splash screen → Start. CPU picks come from `pickCpuPlayerSmart` (rank-weighted + positional need QB3/RB6/WR7/TE3). Verify the "Pick-by-pick recap" panel under the order bar shows a reason per pick and CPU picks stay near the top of the rank board. "End Mock Draft" should reset the board to 0 drafted.

## Tips / gotchas
- The DOM on the Draft tab is large; use targeted zoom/screenshots rather than full DOM reads.
- Native `<select>` dropdowns in the Trade Center are easiest to set via Playwright `select_option`; everything else is fine with native clicks.
- The mock draft advances on a timer (~a few seconds per CPU pick); wait ~20s to accumulate several picks before asserting.
- Trade footnote text is auto-generated if the note field is left blank (format: "X trades PlayerA to Y for PlayerB - date").

## Devin Secrets Needed
- None. Auth is bypassed by injecting a crafted local token (client does not validate signatures). If the app later adds real token validation, a test login credential would be needed.
