// Creates the league_state table and seeds it from the bundled league data.
// Usage: node --env-file=.env.local scripts/seed-league-state.mjs [--force]
import { neon } from '@neondatabase/serverless'
import { ROOKIE_PROSPECTS } from '../src/leagueData.js'
import { INITIAL_LINEUPS } from '../src/lineupData.js'
import { INITIAL_PICK_DATA, INITIAL_FOOTNOTES } from '../src/futurePicksData.js'

const NUM_TEAMS = 8
const NUM_ROUNDS = 3

function generateInitialPicks() {
  const teamIds = Array.from({ length: NUM_TEAMS }, (_, i) => i + 1)
  const picks = []
  let pickNumber = 1
  for (let round = 1; round <= NUM_ROUNDS; round++) {
    const order = round % 2 === 1 ? teamIds : [...teamIds].reverse()
    for (const teamId of order) {
      picks.push({
        id: pickNumber,
        round,
        pickInRound: pickNumber - (round - 1) * NUM_TEAMS,
        originalTeamId: teamId,
        currentTeamId: teamId,
      })
      pickNumber++
    }
  }
  return picks
}

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
  draftPicks: generateInitialPicks(),
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
