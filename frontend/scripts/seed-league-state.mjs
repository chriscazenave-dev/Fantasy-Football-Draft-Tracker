// Creates the league_state table and seeds it from the bundled league data.
// Usage: node --env-file=.env.local scripts/seed-league-state.mjs [--force]
import { neon } from '@neondatabase/serverless'
import { ROOKIE_PROSPECTS } from '../src/leagueData.js'
import { INITIAL_LINEUPS } from '../src/lineupData.js'
import { INITIAL_PICK_DATA, INITIAL_FOOTNOTES } from '../src/futurePicksData.js'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/seed-league-state.mjs')
  process.exit(1)
}

const sql = neon(url)
const force = process.argv.includes('--force')

await sql`
  CREATE TABLE IF NOT EXISTS league_state (
    id TEXT PRIMARY KEY,
    state JSONB NOT NULL,
    version BIGINT NOT NULL DEFAULT 1,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`

const existing = await sql`SELECT version FROM league_state WHERE id = 'default'`
if (existing.length > 0 && !force) {
  console.log(`league_state already seeded (version ${existing[0].version}). Use --force to overwrite.`)
  process.exit(0)
}

const state = {
  lineups: INITIAL_LINEUPS,
  prospects: ROOKIE_PROSPECTS,
  draftedPlayers: {},
  draftOrder: [],
  futurePickData: INITIAL_PICK_DATA,
  footnotes: INITIAL_FOOTNOTES,
}

await sql`
  INSERT INTO league_state (id, state, version, updated_by, updated_at)
  VALUES ('default', ${JSON.stringify(state)}::jsonb, 1, 'seed-script', now())
  ON CONFLICT (id) DO UPDATE
    SET state = EXCLUDED.state,
        version = league_state.version + 1,
        updated_by = EXCLUDED.updated_by,
        updated_at = now()
`
console.log('Seeded league_state.')
