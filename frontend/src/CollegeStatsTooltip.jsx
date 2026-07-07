const STAT_LABELS = {
  games: 'Games',
  completions: 'Comp',
  attempts: 'Att',
  passingYards: 'Pass Yds',
  passingTDs: 'Pass TD',
  interceptions: 'INT',
  rushingYards: 'Rush Yds',
  rushingTDs: 'Rush TD',
  carries: 'Carries',
  receptions: 'Rec',
  receivingYards: 'Rec Yds',
  receivingTDs: 'Rec TD',
  fumbles: 'Fumbles',
  yardsPerCatch: 'Yds/Catch',
  drops: 'Drops',
  blocksGraded: 'Block Grade',
}

export default function CollegeStatsTooltip({ prospect, style }) {
  if (!prospect?.collegeStats) return null
  const stats = prospect.collegeStats
  return (
    <div
      style={style}
      className="fixed z-[100] w-64 bg-white rounded-xl border border-gray-200 shadow-2xl p-4 pointer-events-none"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-900">{prospect.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 font-medium">{prospect.position}</span>
      </div>
      <div className="text-xs text-gray-500 mb-3 font-medium">{prospect.college} &middot; College Stats</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-xs text-gray-400">{STAT_LABELS[key] || key}</span>
            <span className="text-xs font-semibold text-gray-800">{typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
