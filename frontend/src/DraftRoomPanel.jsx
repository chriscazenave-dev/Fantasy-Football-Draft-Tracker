export default function DraftRoomPanel({ teams, members = [], compact = false, title }) {
  const presentTeams = new Set(members.map(member => member.team).filter(Boolean))
  const presentCount = teams.filter(team => presentTeams.has(team.name)).length
  const unmatchedMembers = members.filter(member => !teams.some(team => team.name === member.team))

  return (
    <div className={`border-2 border-[#5a4a32] bg-[#faf8f3] overflow-hidden font-serif ${compact ? 'text-xs' : ''}`}>
      <div className={`border-b-2 border-[#5a4a32] bg-[#efe6d0] ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
        {title && <div className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#5a4a32]">{title}</div>}
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#5a4a32]">
          {presentCount} of 8 owners in the room
        </div>
      </div>
      <div className="divide-y divide-[#e0d5bc]">
        {teams.map(team => {
          const teamMembers = members.filter(member => member.team === team.name)
          const isPresent = teamMembers.length > 0
          const displayNames = teamMembers
            .map(member => member.name || member.username)
            .filter(Boolean)
            .join(', ')

          return (
            <div
              key={team.id}
              className={`flex items-center gap-2 ${compact ? 'px-3 py-2' : 'px-4 py-3'} ${
                isPresent ? '' : 'opacity-60 grayscale'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isPresent ? 'bg-emerald-700' : 'bg-[#9b9281]'}`} />
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{team.name}</p>
                <p className="text-[10px] text-[#8a7a5c] truncate">{team.owner}</p>
              </div>
              <div className={`text-right flex-shrink-0 ${isPresent ? 'text-emerald-800' : 'text-[#9b9281]'}`}>
                <p className="text-[9px] font-black uppercase tracking-wider">{isPresent ? 'In the room' : 'Not in'}</p>
                {isPresent && displayNames && <p className="text-[10px] font-semibold max-w-[120px] truncate">{displayNames}</p>}
              </div>
            </div>
          )
        })}
      </div>
      {unmatchedMembers.length > 0 && (
        <div className={`border-t border-[#c9bb9c] text-[#8a7a5c] italic ${compact ? 'px-3 py-2 text-[10px]' : 'px-4 py-3 text-xs'}`}>
          Also in the room: {unmatchedMembers.map(member => member.name || member.username || member.clientId).join(', ')}
        </div>
      )}
    </div>
  )
}
